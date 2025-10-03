"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { CreateCompanyData } from "@/types"
import { toast } from "sonner"

export default function CreateCompanyPage() {
  const [formData, setFormData] = useState<CreateCompanyData>({
    nombre: '',
    razonSocial: '',
    cuitCuil: '',
    email: '',
    telefono: '',
    direccion: '',
    logoUrl: '',
    codigoEliminador: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim() || !formData.cuitCuil.trim() || !formData.email.trim()) return

    setIsLoading(true)
    
    const uniqueId = 'TC' + Math.random().toString(36).substr(2, 6).toUpperCase()
    
    toast.success(`Empresa "${formData.nombre}" creada exitosamente`, {
      description: `ID único asignado: ${uniqueId}`,
    })
    
    setIsLoading(false)
    router.push('/dashboard')
  }

  if (authLoading) return null

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Crear Empresa</h1>
            <p className="text-muted-foreground">Configura tu nuevo workspace empresarial</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de la Empresa
            </CardTitle>
            <CardDescription>
              Completa los datos básicos de tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Empresa *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: TechCorp"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social</Label>
                  <Input
                    id="razonSocial"
                    placeholder="Ej: TechCorp Sociedad Anónima"
                    value={formData.razonSocial}
                    onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cuitCuil">CUIT/CUIL *</Label>
                  <Input
                    id="cuitCuil"
                    placeholder="30-12345678-9"
                    value={formData.cuitCuil}
                    onChange={(e) => setFormData({...formData, cuitCuil: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    placeholder="+54 11 1234-5678"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo de la Empresa</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {logoFile && (
                    <p className="text-sm text-muted-foreground">
                      Archivo: {logoFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  placeholder="Av. Corrientes 1234, CABA, Argentina"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigoEliminador">Código de Eliminación *</Label>
                <Input
                  id="codigoEliminador"
                  type="password"
                  placeholder="Código secreto para eliminar la empresa"
                  value={formData.codigoEliminador}
                  onChange={(e) => setFormData({...formData, codigoEliminador: e.target.value})}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Este código será requerido para eliminar la empresa permanentemente. Guárdalo en un lugar seguro.
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>💡 Info:</strong> Al crear la empresa obtienes automáticamente el rol de Administrador y se genera un ID único para identificar tu empresa.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading || !formData.nombre.trim() || !formData.cuitCuil.trim() || !formData.email.trim() || !formData.codigoEliminador.trim()}>
                  {isLoading ? 'Creando...' : 'Crear Empresa'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}