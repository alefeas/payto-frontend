export interface User {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  province: string
  city: string
  postalCode: string
  street: string
  streetNumber: string
  floor: string
  apartment: string
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
  register: (data: Record<string, unknown>) => Promise<boolean>
  updateProfile: (profileData: Partial<User>) => Promise<boolean>
  logout: () => void
}