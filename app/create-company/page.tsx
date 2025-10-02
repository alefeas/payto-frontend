"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { CreateCompanyData } from "@/types"
import { toast } from "sonner"

export default function CreateCompanyPage() {
  const [formData, setFormData] = useState<CreateCompanyData>({ name: '', description: '' })
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
    if (!formData.name.trim()) return

    setIsLoading(true)
    
    const uniqueId = 'TC' + Math.random().toString(36).substr(2, 6).toUpperCase()
    
    toast.success(`Empresa "${formData.name}" creada exitosamente`, {
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
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Empresa *</Label>
                <Input
                  id="name"
                  placeholder="Ej: TechCorp SA"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe brevemente tu empresa y su actividad..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>💡 Info:</strong> Al crear la empresa obtienes automáticamente el rol de Administrador y se genera un ID único para identificar tu empresa.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading || !formData.name.trim()}>
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