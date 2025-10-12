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
import { companyService } from "@/services/company.service"

export default function JoinCompanyPage() {
  const [inviteCode, setInviteCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      toast.error('Ingresa un código de invitación')
      return
    }
    
    setIsJoining(true)
    
    try {
      const company = await companyService.joinCompany(inviteCode)
      toast.success(`Te has unido a "${company.name}" exitosamente`)
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Código de invitación inválido')
    } finally {
      setIsJoining(false)
    }
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
              <Input
                id="code"
                placeholder="Ej: ABC123XYZ"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="font-mono"
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>

            <Button onClick={handleJoin} disabled={isJoining || !inviteCode.trim()} className="w-full">
              {isJoining ? 'Uniéndose...' : 'Unirse a Empresa'}
            </Button>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>💡 Info:</strong> El administrador de la empresa debe proporcionarte el código de invitación.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}