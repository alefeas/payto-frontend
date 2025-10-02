export interface User {
  email: string
  name: string
  phone: string
  bio: string
  country: string
  timezone: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  updateProfile: (profileData: Partial<User>) => Promise<boolean>
  logout: () => void
}