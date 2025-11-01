"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import CreateCompanyForm from "@/components/company/create-company-form"

export default function CreateCompanyPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-white p-8 lg:p-12">
      <div className="h-full min-h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="w-full max-w-md">
          <CreateCompanyForm />
        </div>
      </div>
    </div>
  )
}
