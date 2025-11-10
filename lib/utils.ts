import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Convierte Date a string YYYY-MM-DD sin problemas de zona horaria
export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Parsea string YYYY-MM-DD o YYYY-MM-DD HH:MM:SS a Date en zona horaria local (sin conversión UTC)
export function parseDateLocal(dateString: string | Date | null | undefined): Date | null {
  if (!dateString) return null
  
  // Si ya es un objeto Date, devolverlo
  if (dateString instanceof Date) return dateString
  
  // Convertir a string si es necesario
  const str = String(dateString)
  
  // Extraer solo la parte de la fecha (YYYY-MM-DD) si tiene hora
  const datePart = str.split(' ')[0].split('T')[0]
  
  // Intentar parsear el string
  const parts = datePart.split('-')
  if (parts.length !== 3) return null
  
  const [year, month, day] = parts.map(Number)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null
  
  return new Date(year, month - 1, day)
}
