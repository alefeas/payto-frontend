/**
 * Tipos mejorados para respuestas de API y manejo de errores
 */

// Tipo base para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationError[];
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

// Tipo para respuestas exitosas
export interface SuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

// Tipo para respuestas de error
export interface ErrorResponse {
  success: false;
  data?: any;
  message: string;
  errors?: ValidationError[];
  code?: string;
}

// Tipo para errores de validación
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
}

// Tipo para paginación
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    timestamp: string;
    version: string;
    requestId?: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// Tipo para datos de paginación
export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}

// Tipos de errores comunes
export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SERVER_ERROR'
  | 'MAINTENANCE_MODE'
  | 'INVALID_REQUEST'
  | 'RESOURCE_LOCKED';

// Clase de error personalizada
export class ApiError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number,
    public errors?: ValidationError[],
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper para crear respuestas de error tipadas
export function createErrorResponse(
  message: string,
  code: ErrorCode,
  errors?: ValidationError[],
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    success: false,
    message,
    code,
    errors
  };
}

// Helper para crear respuestas exitosas tipadas
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  details?: Record<string, unknown>
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...details
    }
  };
}

// Tipo para funciones que pueden retornar error o éxito
export type Result<T, E = ErrorResponse> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Helper para manejar resultados
export async function handleResult<T>(
  promise: Promise<T>
): Promise<Result<T>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    const errorResponse = error as ErrorResponse;
    return { success: false, error: errorResponse };
  }
}

// Tipo para estados de carga
export type LoadingState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ErrorResponse };

// Tipo para opciones de filtro
export interface FilterOptions {
  search?: string;
  filters?: Record<string, string | number | boolean | null>;
  dateFrom?: string;
  dateTo?: string;
  status?: string | string[];
}

// Tipo para ordenamiento
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Tipo para respuestas de búsqueda
export interface SearchResponse<T> extends PaginatedResponse<T> {
  suggestions?: string[];
  related_terms?: string[];
}

// Tipo para respuestas de estadísticas
export interface StatsResponse<T> extends ApiResponse<T> {
  period: {
    start: string;
    end: string;
  };
  granularity: 'day' | 'week' | 'month' | 'year';
}