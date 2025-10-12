"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function RegisterPage() {
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '',
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    country: 'Argentina',
    province: '',
    city: '',
    postalCode: '',
    street: '',
    streetNumber: '',
    floor: '',
    apartment: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName) newErrors.firstName = 'El nombre es obligatorio'
    if (!formData.lastName) newErrors.lastName = 'El apellido es obligatorio'
    if (!formData.email) {
      newErrors.email = 'El email es obligatorio'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Por favor ingresa un email válido'
      }
    }
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña'
    
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres'
    }
    
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Por favor corrige los errores en el formulario')
      return
    }
    
    setIsLoading(true)
    
    const genderMap: Record<string, string> = {
      'masculino': 'male',
      'femenino': 'female',
      'otro': 'other',
      'prefiero_no_decir': 'prefer_not_to_say'
    }
    
    const registerData = {
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone || undefined,
      date_of_birth: formData.dateOfBirth || undefined,
      gender: formData.gender ? genderMap[formData.gender] : undefined,
      country: formData.country || undefined,
      province: formData.province || undefined,
      city: formData.city || undefined,
      postal_code: formData.postalCode || undefined,
      street: formData.street || undefined,
      street_number: formData.streetNumber || undefined,
      floor: formData.floor || undefined,
      apartment: formData.apartment || undefined,
    }
    
    try {
      await register(registerData)
      toast.success('¡Cuenta creada exitosamente!')
      router.push('/dashboard')
    } catch (error: any) {
      const backendErrors = error.response?.data?.errors
      if (backendErrors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(backendErrors).forEach(([field, messages]: [string, any]) => {
          fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages
        })
        setErrors(fieldErrors)
        toast.error('Por favor corrige los errores en el formulario')
      } else {
        toast.error(error.response?.data?.message || 'Error al registrarse')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">PayTo</CardTitle>
          <CardDescription>Crea tu nueva cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Tu nombre" 
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({...formData, firstName: e.target.value})
                      setErrors(prev => ({ ...prev, firstName: '' }))
                    }}
                    className={errors.firstName || errors.first_name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {(errors.firstName || errors.first_name) && <p className="text-sm text-red-500">{errors.firstName || errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Tu apellido" 
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({...formData, lastName: e.target.value})
                      setErrors(prev => ({ ...prev, lastName: '' }))
                    }}
                    className={errors.lastName || errors.last_name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {(errors.lastName || errors.last_name) && <p className="text-sm text-red-500">{errors.lastName || errors.last_name}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="text" 
                    placeholder="tu@email.com" 
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value})
                      setErrors(prev => ({ ...prev, email: '' }))
                    }}
                    className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    placeholder="+54 11 1234-5678" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date" 
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <select 
                    id="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                    <option value="prefiero_no_decir">Prefiero no decir</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Dirección */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-medium">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input 
                    id="country" 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Provincia</Label>
                  <Input 
                    id="province" 
                    placeholder="Ej: Buenos Aires" 
                    value={formData.province}
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input 
                    id="city" 
                    placeholder="Ej: La Plata" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Calle</Label>
                  <Input 
                    id="street" 
                    placeholder="Ej: Av. Corrientes" 
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="streetNumber">Número</Label>
                  <Input 
                    id="streetNumber" 
                    placeholder="1234" 
                    value={formData.streetNumber}
                    onChange={(e) => setFormData({...formData, streetNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código Postal</Label>
                  <Input 
                    id="postalCode" 
                    placeholder="1414" 
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Piso</Label>
                  <Input 
                    id="floor" 
                    placeholder="Opcional" 
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment">Departamento</Label>
                  <Input 
                    id="apartment" 
                    placeholder="Opcional" 
                    value={formData.apartment}
                    onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            {/* Seguridad */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-medium">Seguridad</h3>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({...formData, password: e.target.value})
                    setErrors(prev => ({ ...prev, password: '' }))
                  }}
                  className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                <p className="text-xs text-muted-foreground">Mínimo 8 caracteres, incluye mayúscula, minúscula, número y carácter especial</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({...formData, confirmPassword: e.target.value})
                    setErrors(prev => ({ ...prev, confirmPassword: '' }))
                  }}
                  className={errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm">
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}