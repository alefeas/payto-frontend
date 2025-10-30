"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/auth.service"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuthToken } = useAuth()
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [resendTimer, setResendTimer] = useState(60) // Iniciar con 60 segundos
  const [expirationTimer, setExpirationTimer] = useState(600) // 10 minutos en segundos
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    // Obtener email de query params o sessionStorage
    const emailParam = searchParams.get('email')
    const savedEmail = sessionStorage.getItem('pendingEmail')
    
    if (emailParam) {
      setEmail(emailParam)
      sessionStorage.setItem('pendingEmail', emailParam)
      sessionStorage.setItem('codeTimestamp', Date.now().toString())
    } else if (savedEmail) {
      setEmail(savedEmail)
    } else {
      // Si no hay email, redirigir al registro
      toast.error('No hay un registro pendiente')
      router.push('/register')
    }

    // Iniciar cooldown de reenvío
    startResendTimer()
  }, [searchParams, router])

  // Cuenta regresiva de expiración
  useEffect(() => {
    if (!email) return

    const timestamp = sessionStorage.getItem('codeTimestamp')
    if (timestamp) {
      const elapsed = Math.floor((Date.now() - parseInt(timestamp)) / 1000)
      const remaining = Math.max(0, 600 - elapsed)
      setExpirationTimer(remaining)
    }

    const interval = setInterval(() => {
      setExpirationTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [email])

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await authService.verifyCode(email, verificationCode)
      await setAuthToken(result.data.token)
      sessionStorage.removeItem('pendingEmail')
      sessionStorage.removeItem('codeTimestamp')
      toast.success('¡Cuenta creada exitosamente!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Código incorrecto')
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0 || isResending) return
    
    setIsResending(true)
    try {
      await authService.resendCode(email)
      toast.success('Nuevo código enviado')
      setVerificationCode('')
      setExpirationTimer(600)
      sessionStorage.setItem('codeTimestamp', Date.now().toString())
      startResendTimer()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al reenviar código')
    } finally {
      setIsResending(false)
    }
  }

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Verificá tu email</CardTitle>
          <CardDescription className="text-base">
            Ingresá el código de 6 dígitos enviado a<br />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="space-y-3">
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-3xl tracking-[0.5em] font-bold h-14 border-2"
                autoFocus
                required
              />
              
              <div className={`flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-lg ${
                expirationTimer === 0 ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400' :
                expirationTimer < 60 ? 'bg-white text-orange-600 dark:bg-white dark:text-orange-400' :
                'bg-white text-blue-600 dark:bg-white dark:text-blue-400'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {expirationTimer === 0 ? (
                  'Código expirado'
                ) : (
                  `Expira en ${Math.floor(expirationTimer / 60)}:${String(expirationTimer % 60).padStart(2, '0')}`
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold" 
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? 'Verificando...' : 'Verificar y Crear Cuenta'}
            </Button>
          </form>

          <div className="space-y-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                ¿No recibiste el código?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={resendTimer > 0 || isResending}
                className="w-full"
              >
                {isResending ? (
                  'Reenviando...'
                ) : resendTimer > 0 ? (
                  `Reenviar en ${resendTimer}s`
                ) : (
                  'Reenviar código'
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <Link href="/register">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm"
                >
                  ← Volver al formulario
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <VerifyForm />
    </Suspense>
  )
}
