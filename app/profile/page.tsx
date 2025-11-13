"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Building, MapPin, Clock, Save } from "lucide-react"
import { toast } from "sonner"
import { formatDateToLocal, parseDateLocal } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/contexts/auth-context"
import { formatPhone } from "@/lib/input-formatters"
import { companyService, Company } from "@/services/company.service"
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton"
import { translateRole } from "@/lib/role-utils"
import { translateTaxCondition } from "@/lib/tax-condition-utils"
import type { CompanyRole } from "@/types"

// Mapeo de género backend -> frontend
function mapGenderFromBackend(gender: string): string {
  const map: Record<string, string> = {
    'male': 'masculino',
    'female': 'femenino',
    'other': 'otro',
    'prefer_not_to_say': 'prefiero_no_decir'
  }
  return map[gender] || ''
}

// Mapeo de género frontend -> backend
function mapGenderToBackend(gender: string): string {
  const map: Record<string, string> = {
    'masculino': 'male',
    'femenino': 'female',
    'otro': 'other',
    'prefiero_no_decir': 'prefer_not_to_say'
  }
  return map[gender] || ''
}

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
  
  const [userCompanies, setUserCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/log-in')
    } else if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: mapGenderFromBackend(user.gender || ''),
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

  useEffect(() => {
    if (isAuthenticated) {
      loadCompanies()
    }
  }, [isAuthenticated])

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const data = await companyService.getCompanies()
      setUserCompanies(data)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoadingCompanies(false)
      setInitialLoad(false)
    }
  }

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
      const dataToSend = {
        ...formData,
        gender: formData.gender ? mapGenderToBackend(formData.gender) : ''
      }
      if (await updateProfile(dataToSend)) {
        toast.success('Perfil actualizado correctamente')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !isAuthenticated || initialLoad) {
    return <ProfileSkeleton />
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <BackButton href="/dashboard" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Mi Perfil</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Gestiona tu información personal y preferencias</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  <span>Mis Perfiles ({userCompanies.filter(c => c.isActive).length})</span>
                </div>
                {loadingCompanies ? (
                  <div className="text-xs text-muted-foreground">Cargando...</div>
                ) : (
                  <div className="space-y-1">
                    {userCompanies.slice(0, 2).map((company) => {
                      const role = (company.role || 'operator').toLowerCase() as CompanyRole
                      const translatedRole = translateRole(role)
                      return (
                        <div key={company.id} className="text-xs text-muted-foreground">
                          <span className="font-medium">{company.name}</span> - {translatedRole}
                        </div>
                      )
                    })}
                    {userCompanies.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{userCompanies.length - 2} más</div>
                    )}
                  </div>
                )}
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
                        placeholder="11 1234-5678" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha de Nacimiento</Label>
                      <DatePicker
                        date={formData.dateOfBirth ? new Date(formData.dateOfBirth + 'T00:00:00') : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const year = date.getFullYear()
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const day = String(date.getDate()).padStart(2, '0')
                            setFormData({...formData, dateOfBirth: `${year}-${month}-${day}`})
                          } else {
                            setFormData({...formData, dateOfBirth: ''})
                          }
                        }}
                        placeholder="Seleccionar fecha"
                        maxDate={new Date()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Género</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder={formData.gender ? undefined : "Seleccionar"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                          <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                        </SelectContent>
                      </Select>
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