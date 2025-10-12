"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Building, MapPin, Clock, Save, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "br", label: "Brasil" },
  { value: "cl", label: "Chile" },
  { value: "co", label: "Colombia" },
  { value: "mx", label: "México" },
  { value: "pe", label: "Perú" },
  { value: "uy", label: "Uruguay" },
  { value: "us", label: "Estados Unidos" },
  { value: "es", label: "España" },
]

const timezones = [
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "America/Santiago", label: "Santiago (GMT-3)" },
  { value: "America/Bogota", label: "Bogotá (GMT-5)" },
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "America/Lima", label: "Lima (GMT-5)" },
  { value: "America/Montevideo", label: "Montevideo (GMT-3)" },
]

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
  
  // Mock workspaces data
  const [userWorkspaces] = useState([
    { id: 1, name: "TechCorp SA", role: "Administrador", status: "active" },
    { id: 2, name: "StartupXYZ", role: "Contador", status: "active" },
    { id: 3, name: "Consulting LLC", role: "Miembro", status: "pending" },
  ])
  
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        country: user.country || 'Argentina',
        province: user.province || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        street: user.street || '',
        streetNumber: user.streetNumber || '',
        floor: user.floor || '',
        apartment: user.apartment || ''
      })
    }
  }, [user, isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName) {
      toast.error('El nombre y apellido son obligatorios')
      return
    }
    
    if (!formData.email) {
      toast.error('El email es obligatorio')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un email válido')
      return
    }
    
    setIsSaving(true)
    
    try {
      if (await updateProfile(formData)) {
        toast.success('Perfil actualizado correctamente')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-muted-foreground">Gestiona tu información personal y preferencias</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="text-2xl">
                  {formData.firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{`${formData.firstName} ${formData.lastName}` || 'Usuario'}</CardTitle>
              <CardDescription>{formData.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(formData.city || formData.province) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{[formData.city, formData.province].filter(Boolean).join(', ')}</span>
                </div>
              )}
              <div className="pt-2">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>Workspaces ({userWorkspaces.filter(w => w.status === 'active').length})</span>
                </div>
                <div className="space-y-1">
                  {userWorkspaces.slice(0, 2).map((workspace) => (
                    <div key={workspace.id} className="text-xs text-muted-foreground">
                      <span className="font-medium">{workspace.name}</span> - {workspace.role}
                    </div>
                  ))}
                  {userWorkspaces.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{userWorkspaces.length - 2} más</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-4">
                  <h3 className="font-semibold">Información Personal</h3>
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
                        type="text" 
                        placeholder="tu@email.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        autoComplete="email"
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

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Dirección</h3>
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

                <Separator />

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/dashboard')}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}