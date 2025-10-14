// Input formatting utilities for automatic hyphen insertion and validation

export const formatCUIT = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 10) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
  return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10)}`
}

export const formatInvoiceNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 12)
  if (numbers.length <= 4) return numbers
  return `${numbers.slice(0, 4)}-${numbers.slice(4)}`
}

export const formatCBU = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 22)
}

export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 15)
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 4) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`
  if (numbers.length <= 8) return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`
  return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 8)}-${numbers.slice(8)}`
}

export const validateCUIT = (value: string): boolean => {
  const numbers = value.replace(/\D/g, '')
  return numbers.length === 11
}

export const validateDNI = (value: string): boolean => {
  const numbers = value.replace(/\D/g, '')
  return numbers.length >= 7 && numbers.length <= 8
}

export const validateCBU = (value: string): boolean => {
  return value.length === 22
}

export const validateInvoiceNumber = (value: string): boolean => {
  const numbers = value.replace(/\D/g, '')
  return numbers.length >= 8 && numbers.length <= 12
}

export const getMaxLengthForDocumentType = (type: string): number => {
  switch (type) {
    case 'CUIT':
    case 'CUIL':
      return 11
    case 'DNI':
      return 8
    case 'CDI':
      return 11
    case 'Pasaporte':
      return 20
    default:
      return 20
  }
}
