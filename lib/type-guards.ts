/**
 * Type guards y utilidades de validación para mejorar la seguridad de tipos
 */

import { User, Company, ApiResponse, ValidationError } from '@/types';

// Type guards para usuarios
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'name' in value &&
    typeof (value as any).id === 'string' &&
    typeof (value as any).email === 'string' &&
    typeof (value as any).name === 'string'
  );
}

export function isValidUser(user: unknown): user is User {
  if (!isUser(user)) return false;
  
  const u = user as User;
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(u.email)) return false;
  
  // Validar campos requeridos
  if (!u.firstName?.trim() || !u.lastName?.trim()) return false;
  
  return true;
}

// Type guards para empresas
export function isCompany(value: unknown): value is Company {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value &&
    'taxId' in value &&
    typeof (value as any).id === 'number' &&
    typeof (value as any).name === 'string' &&
    typeof (value as any).email === 'string' &&
    typeof (value as any).taxId === 'string'
  );
}

export function isValidCompany(company: unknown): company is Company {
  if (!isCompany(company)) return false;
  
  const c = company as Company;
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(c.email)) return false;
  
  // Validar CUIT/CUIL (11 dígitos)
  const taxIdRegex = /^\d{11}$/;
  if (!taxIdRegex.test(c.taxId)) return false;
  
  // Validar campos requeridos
  if (!c.name?.trim() || c.name.length < 2) return false;
  
  return true;
}

// Type guards para respuestas de API
export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'data' in value &&
    typeof (value as any).success === 'boolean'
  );
}

export function isApiError(value: unknown): value is { success: false; message: string; errors?: ValidationError[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'message' in value &&
    (value as any).success === false &&
    typeof (value as any).message === 'string'
  );
}

// Validadores de formulario
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCuitCuil(taxId: string): boolean {
  const taxIdRegex = /^\d{11}$/;
  if (!taxIdRegex.test(taxId)) return false;
  
  // Validación de CUIT/CUIL con algoritmo de verificación
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;
  
  for (let i = 0; i < 10; i++) {
    suma += parseInt(taxId[i]) * multiplicadores[i];
  }
  
  const resto = suma % 11;
  const digitoVerificador = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;
  
  return parseInt(taxId[10]) === digitoVerificador;
}

// Utilidades de tipos
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

export type NonNullable<T> = T extends null | undefined ? never : T;

// Función de aserción de tipos
export function assertType<T>(value: unknown, guard: (value: unknown) => value is T): T {
  if (!guard(value)) {
    throw new Error(`Type assertion failed: value does not match expected type`);
  }
  return value;
}

// Función de parsing seguro
export function safeParseJson<T>(jsonString: string, guard: (value: unknown) => value is T): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}