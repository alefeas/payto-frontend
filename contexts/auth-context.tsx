"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthContextType } from '@/types'
import { authService } from '@/services/auth.service'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        if (token) {
          try {
            const userData = await authService.getCurrentUser()
            setUser(userData)
            setIsAuthenticated(true)
          } catch (error) {
            localStorage.removeItem('auth_token')
          }
        }
      }
      setIsLoading(false)
    }
    loadUser()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, password)
      localStorage.setItem('auth_token', response.data.token)
      setUser(response.data.user)
      setIsAuthenticated(true)
      return true
    } catch (error) {
      throw error
    }
  }

  const register = async (data: any): Promise<boolean> => {
    try {
      const response = await authService.register(data)
      localStorage.setItem('auth_token', response.data.token)
      setUser(response.data.user)
      setIsAuthenticated(true)
      return true
    } catch (error) {
      throw error
    }
  }

  const updateProfile = async (profileData: any): Promise<boolean> => {
    if (!user) return false
    try {
      const genderMap: Record<string, string> = {
        'masculino': 'male',
        'femenino': 'female',
        'otro': 'other',
        'prefiero_no_decir': 'prefer_not_to_say'
      }
      
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone || undefined,
        date_of_birth: profileData.dateOfBirth || undefined,
        gender: profileData.gender ? genderMap[profileData.gender] : undefined,
        country: profileData.country || undefined,
        province: profileData.province || undefined,
        city: profileData.city || undefined,
        postal_code: profileData.postalCode || undefined,
        street: profileData.street || undefined,
        street_number: profileData.streetNumber || undefined,
        floor: profileData.floor || undefined,
        apartment: profileData.apartment || undefined,
      }
      
      const updatedUser = await authService.updateProfile(updateData)
      setUser(updatedUser)
      return true
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Ignore error
    }
    localStorage.removeItem('auth_token')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      updateProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}