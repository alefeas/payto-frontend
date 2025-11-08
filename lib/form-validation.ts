/**
 * Utilidades de validación para formularios con tipos estrictos
 */

import { LoginCredentials, RegisterCredentials } from '@/types';
import { validateEmail, validatePassword, validateCuitCuil } from '@/lib/type-guards';

// Tipos para errores de validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: ValidationError[];
  data?: T;
}

// Validador de credenciales de login
export function validateLoginCredentials(
  email: string,
  password: string
): ValidationResult<LoginCredentials> {
  const errors: ValidationError[] = [];

  // Validar email
  if (!email?.trim()) {
    errors.push({ field: 'email', message: 'El email es requerido' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Por favor ingresa un email válido' });
  }

  // Validar contraseña
  if (!password?.trim()) {
    errors.push({ field: 'password', message: 'La contraseña es requerida' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { email: email.trim(), password } : undefined
  };
}

// Validador de credenciales de registro
export function validateRegisterCredentials(
  data: Partial<RegisterCredentials>
): ValidationResult<RegisterCredentials> {
  const errors: ValidationError[] = [];

  // Validar email
  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'El email es requerido' });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Por favor ingresa un email válido' });
  }

  // Validar contraseña
  if (!data.password?.trim()) {
    errors.push({ field: 'password', message: 'La contraseña es requerida' });
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      passwordValidation.errors.forEach(error => {
        errors.push({ field: 'password', message: error });
      });
    }
  }

  // Validar nombres
  if (!data.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'El nombre es requerido' });
  } else if (data.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'El nombre debe tener al menos 2 caracteres' });
  }

  if (!data.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'El apellido es requerido' });
  } else if (data.lastName.trim().length < 2) {
    errors.push({ field: 'lastName', message: 'El apellido debe tener al menos 2 caracteres' });
  }

  // Validar teléfono (opcional)
  if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Por favor ingresa un número de teléfono válido' });
  }

  // Validar fecha de nacimiento (opcional)
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (birthDate > today) {
      errors.push({ field: 'dateOfBirth', message: 'La fecha de nacimiento no puede ser futura' });
    } else if (age < 18) {
      errors.push({ field: 'dateOfBirth', message: 'Debes tener al menos 18 años' });
    }
  }

  // Validar dirección (opcional)
  if (data.country && data.country.length < 2) {
    errors.push({ field: 'country', message: 'El país debe tener al menos 2 caracteres' });
  }

  if (data.province && data.province.length < 2) {
    errors.push({ field: 'province', message: 'La provincia debe tener al menos 2 caracteres' });
  }

  if (data.city && data.city.length < 2) {
    errors.push({ field: 'city', message: 'La ciudad debe tener al menos 2 caracteres' });
  }

  if (data.postalCode && !/^\d{4,10}$/.test(data.postalCode)) {
    errors.push({ field: 'postalCode', message: 'El código postal debe tener entre 4 y 10 dígitos' });
  }

  if (data.streetNumber && !/^\d+$/.test(data.streetNumber)) {
    errors.push({ field: 'streetNumber', message: 'El número debe ser un valor numérico' });
  }

  if (data.floor && !/^\d+$/.test(data.floor)) {
    errors.push({ field: 'floor', message: 'El piso debe ser un valor numérico' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data as RegisterCredentials : undefined
  };
}

// Validador de CUIT/CUIL
export function validateCompanyTaxId(taxId: string): ValidationResult<string> {
  const errors: ValidationError[] = [];

  if (!taxId?.trim()) {
    errors.push({ field: 'taxId', message: 'El CUIT/CUIL es requerido' });
  } else if (!validateCuitCuil(taxId)) {
    errors.push({ field: 'taxId', message: 'Por favor ingresa un CUIT/CUIL válido (11 dígitos)' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? taxId.trim() : undefined
  };
}

// Validador de códigos de invitación
export function validateInviteCode(inviteCode: string): ValidationResult<string> {
  const errors: ValidationError[] = [];

  if (!inviteCode?.trim()) {
    errors.push({ field: 'inviteCode', message: 'El código de invitación es requerido' });
  } else if (inviteCode.length < 6) {
    errors.push({ field: 'inviteCode', message: 'El código de invitación debe tener al menos 6 caracteres' });
  } else if (!/^[A-Za-z0-9\-_]+$/.test(inviteCode)) {
    errors.push({ field: 'inviteCode', message: 'El código de invitación solo puede contener letras, números, guiones y guiones bajos' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? inviteCode.trim() : undefined
  };
}

// Función auxiliar para mostrar errores
export function getFieldErrors(errors: ValidationError[], fieldName: string): string[] {
  return errors
    .filter(error => error.field === fieldName)
    .map(error => error.message);
}

// Función auxiliar para verificar si un campo tiene errores
export function hasFieldError(errors: ValidationError[], fieldName: string): boolean {
  return errors.some(error => error.field === fieldName);
}

// Función para sanitizar entrada de usuario
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Eliminar caracteres potencialmente peligrosos
    .replace(/\s+/g, ' ') // Normalizar espacios
    .substring(0, 255); // Limitar longitud
}