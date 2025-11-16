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
  // Remove all non-digits
  let numbers = value.replace(/\D/g, '')
  
  // Remove leading 54 if present (country code)
  if (numbers.startsWith('54')) {
    numbers = numbers.slice(2)
  }
  
  // Limit to 10 digits
  numbers = numbers.slice(0, 10)
  
  // Format: +54 11 XXXX-XXXX (standard Argentine format)
  if (numbers.length === 0) return ''
  if (numbers.length <= 2) return `+54 ${numbers}`
  if (numbers.length <= 6) return `+54 ${numbers.slice(0, 2)} ${numbers.slice(2)}`
  return `+54 ${numbers.slice(0, 2)} ${numbers.slice(2, 6)}-${numbers.slice(6)}`
}

export const validateCUIT = (value: string): boolean => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length !== 11) return false
  
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * multipliers[i]
  }
  
  let checkDigit = 11 - (sum % 11)
  if (checkDigit === 11) checkDigit = 0
  if (checkDigit === 10) checkDigit = 9
  
  return checkDigit === parseInt(numbers[10])
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
