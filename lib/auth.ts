"use client"

export const login = (email: string, password: string) => {
  // Simulación temporal - cualquier email/password funciona
  if (email && password) {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userEmail', email)
    return true
  }
  return false
}

export const register = (name: string, email: string, password: string) => {
  // Simulación temporal
  if (name && email && password) {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userEmail', email)
    localStorage.setItem('userName', name)
    return true
  }
  return false
}

export const updateProfile = (profileData: {
  name: string
  email: string
  phone?: string
  bio?: string
  country?: string
  timezone?: string
}) => {
  // Simulación temporal
  if (profileData.name && profileData.email) {
    localStorage.setItem('userName', profileData.name)
    localStorage.setItem('userEmail', profileData.email)
    if (profileData.phone) localStorage.setItem('userPhone', profileData.phone)
    if (profileData.bio) localStorage.setItem('userBio', profileData.bio)
    if (profileData.country) localStorage.setItem('userCountry', profileData.country)
    if (profileData.timezone) localStorage.setItem('userTimezone', profileData.timezone)
    return true
  }
  return false
}

export const logout = () => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userName')
  localStorage.removeItem('userPhone')
  localStorage.removeItem('userBio')
  localStorage.removeItem('userCountry')
  localStorage.removeItem('userTimezone')
}

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('isAuthenticated') === 'true'
}

export const getUser = () => {
  if (typeof window === 'undefined') return null
  return {
    email: localStorage.getItem('userEmail'),
    name: localStorage.getItem('userName') || 'Usuario',
    phone: localStorage.getItem('userPhone') || '',
    bio: localStorage.getItem('userBio') || '',
    country: localStorage.getItem('userCountry') || '',
    timezone: localStorage.getItem('userTimezone') || ''
  }
}