"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

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
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    setIsLoading(true)
    if (await register(`${formData.firstName} ${formData.lastName}`, formData.email, formData.password)) {
      router.push('/dashboard')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">PayTo</CardTitle>
          <CardDescription>Crea tu nueva cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Tu apellido" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
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
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
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