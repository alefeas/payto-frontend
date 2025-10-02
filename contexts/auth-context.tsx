"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthContextType } from '@/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authenticated = localStorage.getItem('isAuthenticated') === 'true'
      if (authenticated) {
        const userData = {
          email: localStorage.getItem('userEmail') || '',
          name: localStorage.getItem('userName') || 'Usuario',
          phone: localStorage.getItem('userPhone') || '',
          bio: localStorage.getItem('userBio') || '',
          country: localStorage.getItem('userCountry') || '',
          timezone: localStorage.getItem('userTimezone') || ''
        }
        setUser(userData)
        setIsAuthenticated(true)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email && password) {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userEmail', email)
      
      const userData = {
        email,
        name: localStorage.getItem('userName') || 'Usuario',
        phone: localStorage.getItem('userPhone') || '',
        bio: localStorage.getItem('userBio') || '',
        country: localStorage.getItem('userCountry') || '',
        timezone: localStorage.getItem('userTimezone') || ''
      }
      
      setUser(userData)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    if (name && email && password) {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userName', name)
      
      const userData = { email, name, phone: '', bio: '', country: '', timezone: '' }
      
      setUser(userData)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    if (!user) return false
    
    const updatedUser = { ...user, ...profileData }
    
    localStorage.setItem('userName', updatedUser.name)
    localStorage.setItem('userEmail', updatedUser.email)
    if (updatedUser.phone) localStorage.setItem('userPhone', updatedUser.phone)
    if (updatedUser.bio) localStorage.setItem('userBio', updatedUser.bio)
    if (updatedUser.country) localStorage.setItem('userCountry', updatedUser.country)
    if (updatedUser.timezone) localStorage.setItem('userTimezone', updatedUser.timezone)
    
    setUser(updatedUser)
    return true
  }

  const logout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userPhone')
    localStorage.removeItem('userBio')
    localStorage.removeItem('userCountry')
    localStorage.removeItem('userTimezone')
    
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