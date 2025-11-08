/**
 * Utilidades para manejo de errores y validación
 */

import { ErrorResponse, ValidationError, ErrorCode } from '@/types/api';
import { toast } from 'sonner';

// Mapeo de códigos de error a mensajes amigables
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR: 'Hay errores en los datos ingresados',
  AUTHENTICATION_ERROR: 'Error de autenticación',
  AUTHORIZATION_ERROR: 'No tienes permisos para realizar esta acción',
  NOT_FOUND: 'Recurso no encontrado',
  CONFLICT: 'Conflicto con los datos existentes',
  RATE_LIMIT_EXCEEDED: 'Demasiadas solicitudes. Por favor, intenta más tarde',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde',
  MAINTENANCE_MODE: 'El sistema está en mantenimiento',
  INVALID_REQUEST: 'Solicitud inválida',
  RESOURCE_LOCKED: 'El recurso está bloqueado temporalmente'
};

// Interfaz para opciones de manejo de errores
interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  customMessage?: string;
  fallbackMessage?: string;
}

// Clase para manejo centralizado de errores
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ timestamp: Date; error: ErrorResponse; context?: string }> = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Manejar error con opciones configurables
  public handleError(
    error: ErrorResponse | Error | unknown,
    context?: string,
    options: ErrorHandlerOptions = {}
  ): void {
    const {
      showToast = true,
      logToConsole = true,
      customMessage,
      fallbackMessage = 'Ocurrió un error inesperado'
    } = options;

    let errorResponse: ErrorResponse;

    // Convertir diferentes tipos de errores a ErrorResponse
    if (this.isErrorResponse(error)) {
      errorResponse = error;
    } else if (error instanceof Error) {
      errorResponse = {
        success: false,
        message: error.message,
        code: 'SERVER_ERROR'
      };
    } else {
      errorResponse = {
        success: false,
        message: fallbackMessage,
        code: 'SERVER_ERROR'
      };
    }

    // Registrar el error
    this.logError(errorResponse, context);

    // Mostrar notificación
    if (showToast) {
      this.showErrorNotification(errorResponse, customMessage);
    }

    // Log en consola
    if (logToConsole) {
      this.consoleLogError(errorResponse, context);
    }
  }

  // Manejar errores de validación específicamente
  public handleValidationErrors(
    errors: ValidationError[],
    options: ErrorHandlerOptions = {}
  ): void {
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Por favor corrige los siguientes errores:',
      code: 'VALIDATION_ERROR',
      errors
    };

    this.handleError(errorResponse, 'Form Validation', options);
  }

  // Verificar si un objeto es ErrorResponse
  private isErrorResponse(obj: any): obj is ErrorResponse {
    return (
      obj &&
      typeof obj === 'object' &&
      obj.success === false &&
      typeof obj.message === 'string'
    );
  }

  // Registrar error en el log
  private logError(error: ErrorResponse, context?: string): void {
    this.errorLog.push({
      timestamp: new Date(),
      error,
      context
    });

    // Mantener solo los últimos 100 errores
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  // Mostrar notificación de error
  private showErrorNotification(error: ErrorResponse, customMessage?: string): void {
    const message = customMessage || this.getErrorMessage(error);
    
    if (error.code === 'VALIDATION_ERROR' && error.errors) {
      // Mostrar errores de validación como lista
      const errorList = error.errors.map(err => err.message).join('\n');
      toast.error(`${message}\n${errorList}`);
    } else {
      toast.error(message);
    }
  }

  // Obtener mensaje de error amigable
  private getErrorMessage(error: ErrorResponse): string {
    if (error.code && error.code in ERROR_MESSAGES) {
      return ERROR_MESSAGES[error.code as ErrorCode];
    }
    return error.message || 'Ocurrió un error inesperado';
  }

  // Log en consola con formato
  private consoleLogError(error: ErrorResponse, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    
    console.error(`[${timestamp}] ${contextStr} Error:`, {
      code: error.code,
      message: error.message,
      errors: error.errors,
      details: error
    });
  }

  // Obtener estadísticas de errores
  public getErrorStats(): Record<ErrorCode, number> {
    const stats: Record<ErrorCode, number> = {} as Record<ErrorCode, number>;
    
    this.errorLog.forEach(({ error }) => {
      if (error.code && error.code in ERROR_MESSAGES) {
        const code = error.code as ErrorCode;
        stats[code] = (stats[code] || 0) + 1;
      }
    });

    return stats;
  }

  // Limpiar log de errores
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  // Obtener errores recientes
  public getRecentErrors(limit: number = 10): Array<{ timestamp: Date; error: ErrorResponse; context?: string }> {
    return this.errorLog.slice(-limit);
  }
}

// Instancia global del manejador de errores
export const errorHandler = ErrorHandler.getInstance();

// Helper para manejar errores de forma simple
export function handleError(
  error: ErrorResponse | Error | unknown,
  context?: string,
  options?: ErrorHandlerOptions
): void {
  errorHandler.handleError(error, context, options);
}

// Helper para manejar errores de validación
export function handleValidationErrors(
  errors: ValidationError[],
  options?: ErrorHandlerOptions
): void {
  errorHandler.handleValidationErrors(errors, options);
}

// Helper para crear un error estándar
export function createError(
  message: string,
  code: ErrorCode = 'SERVER_ERROR',
  errors?: ValidationError[]
): ErrorResponse {
  return {
    success: false,
    message,
    code,
    errors
  };
}

// Helper para validar y manejar errores en formularios
export function validateFormData<T>(
  data: T,
  validators: Record<string, (value: any) => ValidationError | null>
): ValidationError[] {
  const errors: ValidationError[] = [];

  Object.entries(validators).forEach(([field, validator]) => {
    const error = validator(data[field as keyof T]);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
}

// Validadores comunes
export const commonValidators = {
  email: (value: string): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      return { field: 'email', message: 'El email es requerido' };
    }
    if (!emailRegex.test(value)) {
      return { field: 'email', message: 'El email no es válido' };
    }
    return null;
  },

  password: (value: string): ValidationError | null => {
    if (!value) {
      return { field: 'password', message: 'La contraseña es requerida' };
    }
    if (value.length < 6) {
      return { field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    return null;
  },

  required: (field: string, value: any): ValidationError | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { field, message: `${field} es requerido` };
    }
    return null;
  },

  minLength: (field: string, min: number) => (value: string): ValidationError | null => {
    if (value && value.length < min) {
      return { field, message: `${field} debe tener al menos ${min} caracteres` };
    }
    return null;
  },

  maxLength: (field: string, max: number) => (value: string): ValidationError | null => {
    if (value && value.length > max) {
      return { field, message: `${field} no debe exceder ${max} caracteres` };
    }
    return null;
  }
};