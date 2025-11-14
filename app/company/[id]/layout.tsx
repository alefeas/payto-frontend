"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { companyService } from "@/services/company.service"
import { toast } from "sonner"

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const validateAccess = async () => {
      try {
        // Obtener todas las empresas del usuario
        const companies = await companyService.getCompanies()
        
        // Verificar si el usuario es miembro de esta empresa
        const isMember = companies.some(company => company.id === companyId)
        
        if (!isMember) {
          toast.error('No tienes acceso a esta empresa')
          router.push('/dashboard')
          return
        }
        
        setIsAuthorized(true)
      } catch (error: any) {
        console.error('Error validating company access:', error)
        
        // Si el error es 401/403, el interceptor ya manejó la redirección
        if (error.response?.status === 401 || error.response?.status === 403) {
          return
        }
        
        toast.error('Error al verificar acceso a la empresa')
        router.push('/dashboard')
      } finally {
        setIsValidating(false)
      }
    }

    if (companyId) {
      validateAccess()
    }
  }, [companyId, router])

  // No mostrar nada mientras valida - dejar que cada página muestre su propio skeleton
  if (isValidating) {
    return null
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
