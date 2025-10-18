"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { companyService } from "@/services/company.service"
import { PerceptionAgentConfig } from "@/components/company/PerceptionAgentConfig"

export default function PerceptionConfigPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [companyName, setCompanyName] = useState("")
  const [isPerceptionAgent, setIsPerceptionAgent] = useState(false)
  const [autoPerceptions, setAutoPerceptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated && id) {
      loadData()
    }
  }, [isAuthenticated, authLoading, id, router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const company = await companyService.getCompany(id as string)
      setCompanyName(company.name)
      setIsPerceptionAgent(company.isPerceptionAgent || false)
      setAutoPerceptions(company.autoPerceptions || [])
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Configuración de Percepciones</h1>
            <p className="text-muted-foreground">{companyName}</p>
          </div>
        </div>

        <PerceptionAgentConfig
          companyId={id as string}
          isPerceptionAgent={isPerceptionAgent}
          autoPerceptions={autoPerceptions}
          onUpdate={loadData}
        />
      </div>
    </div>
  )
}
