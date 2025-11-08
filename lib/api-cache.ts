/**
 * Utilidades para cacheo y deduplicación de llamadas a API
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  strategy?: 'memory' | 'session' | 'local';
}

interface RequestOptions extends RequestInit {
  cacheKey?: string;
  cacheTTL?: number;
  skipCache?: boolean;
  dedupeKey?: string;
}

export class ApiCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      strategy: options.strategy || 'memory'
    };
  }

  // Generar clave de caché única
  private generateCacheKey(url: string, options: RequestOptions): string {
    if (options.cacheKey) {
      return options.cacheKey;
    }

    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    const headers = options.headers ? JSON.stringify(options.headers) : '';
    
    return `${method}:${url}:${body}:${headers}`;
  }

  // Verificar si la entrada está expirada
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  // Limpiar entradas expiradas
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Limpiar caché si excede el tamaño máximo
  private cleanupOversized(): void {
    if (this.memoryCache.size > this.options.maxSize) {
      // Eliminar las entradas más antiguas
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.options.maxSize + 1);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  // Obtener datos de la caché
  private getFromCache<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Guardar datos en la caché
  private setCache<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + (ttl || this.options.ttl),
      key
    };

    this.memoryCache.set(key, entry);
    this.cleanupOversized();
  }

  // Realizar petición con deduplicación y caché
  async fetchWithCache<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipCache = false, dedupeKey, cacheTTL } = options;
    
    // Generar claves para caché y deduplicación
    const cacheKey = this.generateCacheKey(url, options);
    const dedupeKeyStr = dedupeKey || cacheKey;

    // Verificar si hay una petición pendiente (deduplicación)
    const pendingRequest = this.pendingRequests.get(dedupeKeyStr);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Verificar caché si no se debe saltar
    if (!skipCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData !== null) {
        return cachedData;
      }
    }

    // Realizar la petición
    const requestPromise = this.performRequest<T>(url, options)
      .then(data => {
        // Guardar en caché si corresponde
        if (!skipCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
          this.setCache(cacheKey, data, cacheTTL);
        }
        return data;
      })
      .finally(() => {
        // Limpiar petición pendiente
        this.pendingRequests.delete(dedupeKeyStr);
      });

    // Guardar petición como pendiente
    this.pendingRequests.set(dedupeKeyStr, requestPromise);

    return requestPromise;
  }

  // Realizar la petición HTTP real
  private async performRequest<T>(url: string, options: RequestOptions): Promise<T> {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Invalidar caché para una clave específica
  invalidateCache(key: string): void {
    this.memoryCache.delete(key);
  }

  // Invalidar caché por patrón
  invalidateCacheByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const [key] of this.memoryCache.entries()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Limpiar toda la caché
  clearCache(): void {
    this.memoryCache.clear();
    this.pendingRequests.clear();
  }

  // Obtener estadísticas de la caché
  getStats(): {
    totalEntries: number;
    pendingRequests: number;
    expiredEntries: number;
  } {
    let expiredCount = 0;
    for (const entry of this.memoryCache.values()) {
      if (this.isExpired(entry)) {
        expiredCount++;
      }
    }

    return {
      totalEntries: this.memoryCache.size,
      pendingRequests: this.pendingRequests.size,
      expiredEntries: expiredCount
    };
  }

  // Ejecutar limpieza periódica
  startCleanup(interval: number = 60000): void {
    setInterval(() => {
      this.cleanupExpired();
    }, interval);
  }
}

// Instancia global de la caché
export const apiCache = new ApiCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  strategy: 'memory'
});

// Decorador para caché de métodos
export function cached(ttl?: number, dedupeKey?: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
      
      return apiCache.fetchWithCache('method-call', {
        cacheKey,
        cacheTTL: ttl,
        dedupeKey: dedupeKey ? `${dedupeKey}:${JSON.stringify(args)}` : undefined,
        skipCache: false
      }).catch(() => {
        // Si falla la caché, ejecutar el método original
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}

// Helper para invalidar caché después de mutaciones
export function invalidateOnMutation(patterns: string[]) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Invalidar caché después de la mutación
      patterns.forEach(pattern => {
        apiCache.invalidateCacheByPattern(pattern);
      });

      return result;
    };

    return descriptor;
  };
}

// Función para crear claves de caché específicas
export function createCacheKey(prefix: string, ...parts: any[]): string {
  const keyParts = parts.map(part => 
    typeof part === 'object' ? JSON.stringify(part) : String(part)
  );
  return `${prefix}:${keyParts.join(':')}`;
}

// Función para limpiar caché relacionada con un usuario
export function clearUserCache(userId?: string): void {
  if (userId) {
    apiCache.invalidateCacheByPattern(`user:${userId}:*`);
  }
  // Limpiar caché general de usuario
  apiCache.invalidateCacheByPattern('user:*');
  apiCache.invalidateCacheByPattern('auth:*');
}

// Función para limpiar caché de empresa
export function clearCompanyCache(companyId?: string): void {
  if (companyId) {
    apiCache.invalidateCacheByPattern(`company:${companyId}:*`);
  }
  // Limpiar caché general de empresa
  apiCache.invalidateCacheByPattern('company:*');
}

// Iniciar limpieza periódica
if (typeof window !== 'undefined') {
  apiCache.startCleanup();
}