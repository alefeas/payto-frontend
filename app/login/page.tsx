"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      toast.success('Contraseña restablecida correctamente. Podés iniciar sesión.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({ email: '', password: '' })
    
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'El email es obligatorio' }))
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Por favor ingresa un email válido' }))
      return
    }
    
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: 'La contraseña es obligatoria' }))
      return
    }
    
    setIsLoading(true)
    try {
      await login(formData.email, formData.password)
      toast.success('¡Bienvenido!')
      router.push('/dashboard')
    } catch (error: any) {
      setIsLoading(false)
      if (error.response?.status === 401) {
        toast.error('Credenciales inválidas')
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Error al iniciar sesión. Por favor, intente nuevamente.')
      }
      return
    }
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">PayTo</CardTitle>
          <CardDescription>Inicia sesión en tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="text" 
                placeholder="tu@email.com" 
                value={formData.email}
                onChange={(e) => {
                  setFormData({...formData, email: e.target.value})
                  setErrors(prev => ({ ...prev, email: '' }))
                }}
                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                autoComplete="email"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value})
                  setErrors(prev => ({ ...prev, password: '' }))
                }}
                className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="text-center mt-4 space-y-2">
            <Link href="/forgot-password">
              <Button variant="link" className="text-sm">
                ¿Olvidaste tu contraseña?
              </Button>
            </Link>
            <div>
              <Link href="/register">
                <Button variant="ghost" className="text-sm">
                  ¿No tienes cuenta? Regístrate
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Suspense fallback={<Card className="w-full max-w-md"><CardContent className="p-6">Cargando...</CardContent></Card>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}