"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Search, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// Mock invite codes con roles específicos
const mockInvites = [
  { inviteCode: 'ADMIN-TECH-2024', companyName: 'TechCorp SA', description: 'Empresa de tecnología', memberCount: 12, uniqueId: 'TC8X9K2L', role: 'Administrador' },
  { inviteCode: 'COUNT-START-2024', companyName: 'StartupXYZ', description: 'Startup innovadora', memberCount: 5, uniqueId: 'SU4P7M9N', role: 'Contador' },
  { inviteCode: 'MEMBER-CONSULT-2024', companyName: 'Consulting LLC', description: 'Consultoría empresarial', memberCount: 8, uniqueId: 'CL1Q3R8T', role: 'Miembro' },
]

export default function JoinCompanyPage() {
  const [inviteCode, setInviteCode] = useState('')
  const [foundCompany, setFoundCompany] = useState<typeof mockInvites[0] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSearch = () => {
    if (!inviteCode.trim()) return
    
    setIsSearching(true)
    
    const invite = mockInvites.find(i => i.inviteCode.toUpperCase() === inviteCode.toUpperCase())
    
    if (invite) {
      setFoundCompany(invite)
    } else {
      setFoundCompany(null)
      toast.error('Código de invitación inválido')
    }
    
    setIsSearching(false)
  }

  const handleJoin = () => {
    if (!foundCompany) return
    
    setIsJoining(true)
    
    toast.success(`Te has unido a "${foundCompany.companyName}"`, {
      description: `Rol asignado: ${foundCompany.role}`,
    })
    
    setIsJoining(false)
    router.push('/dashboard')
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Unirse a Empresa</h1>
            <p className="text-muted-foreground">Ingresa el código de invitación</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Empresa
            </CardTitle>
            <CardDescription>
              Ingresa el código de invitación que te proporcionó el administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Invitación</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="Ej: JOIN-TECH-2024"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="font-mono"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching || !inviteCode.trim()}
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>💡 Cómo funciona:</strong> Cada código de invitación tiene un rol predefinido. Al usarlo, obtienes ese rol automáticamente en la empresa.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Company Found */}
        {foundCompany && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Building2 className="h-5 w-5" />
                Empresa Encontrada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{foundCompany.companyName}</h3>
                  <p className="text-sm text-muted-foreground">{foundCompany.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{foundCompany.memberCount} miembros</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Rol: {foundCompany.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleJoin} disabled={isJoining}>
                  {isJoining ? 'Uniéndose...' : 'Unirse Ahora'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFoundCompany(null)
                    setInviteCode('')
                  }}
                >
                  Buscar Otra
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}