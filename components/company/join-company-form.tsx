"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { companyService } from "@/services/company.service"
import { FormFooterLink } from "@/components/ui/form-footer-link"
import Image from "next/image"
import Link from "next/link"

export default function JoinCompanyForm() {
  const router = useRouter()
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteCode.trim()) {
      toast.error('Ingresa un código de invitación')
      return
    }

    setIsLoading(true)

    try {
      const company = await companyService.joinCompany(inviteCode)
      toast.success(`Te has unido a "${company.name}" exitosamente`)
      router.push(`/company/${company.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Código de invitación inválido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Logo */}
      <div className="text-center">
        <Link href="/dashboard" className="inline-block">
          <Image
            src="/brand/payto.png"
            alt="PayTo Logo"
            width={160}
            height={160}
            className="object-contain hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Unirse a Empresa</h2>
        <p className="text-gray-600 text-sm">
          Solicitá el código de invitación al administrador de la empresa
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-center block">Código de Invitación</Label>
            <Input
              id="inviteCode"
              placeholder="ABC123XYZ"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="h-14 text-center text-2xl font-semibold tracking-[0.25em] uppercase"
              maxLength={20}
            />
            <div className="flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-lg bg-blue-50 text-blue-600">
              <AlertCircle className="w-4 h-4" />
              Solicita el código al administrador de la empresa
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoading || !inviteCode.trim()}
          >
            {isLoading ? "Uniéndose..." : "Unirse a Empresa"}
          </Button>
        </form>

        <FormFooterLink
          text="¿No tenés un código?"
          linkText="Crear nueva empresa"
          href="/create-company"
        />
      </div>
    </div>
  )
}
