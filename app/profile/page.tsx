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
    name: '',
    email: '',
    phone: '',
    bio: '',
    country: '',
    timezone: ''
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
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        country: user.country,
        timezone: user.timezone
      })
    }
  }, [user, isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    if (await updateProfile(formData)) {
      toast.success('Perfil actualizado correctamente')
    }
    setIsSaving(false)
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Summary */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="text-2xl">
                  {formData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{formData.name || 'Usuario'}</CardTitle>
              <CardDescription>{formData.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.country && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{countries.find(c => c.value === formData.country)?.label}</span>
                </div>
              )}
              {formData.timezone && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{timezones.find(t => t.value === formData.timezone)?.label}</span>
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

          {/* Workspaces */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Mis Workspaces
              </CardTitle>
              <CardDescription>
                Empresas donde participas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {userWorkspaces.map((workspace) => (
                <div key={workspace.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{workspace.name}</p>
                    <p className="text-xs text-muted-foreground">{workspace.role}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    workspace.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {workspace.status === 'active' ? 'Activo' : 'Pendiente'}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                Ver todos los workspaces
              </Button>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Información Básica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input 
                        id="name" 
                        placeholder="Tu nombre completo" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+54 9 11 1234-5678" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <Separator />

                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Sobre Ti</h3>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Contános un poco sobre ti, tu experiencia profesional, intereses..." 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>

                <Separator />

                {/* Location & Timezone */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Ubicación y Zona Horaria</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu país" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona Horaria</Label>
                      <Select value={formData.timezone} onValueChange={(value) => setFormData({...formData, timezone: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu zona horaria" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              {timezone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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