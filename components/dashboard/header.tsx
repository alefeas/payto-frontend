"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function DashboardHeader() {
  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params?.id as string

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">PayTo</h1>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    router.push('/')
  }

  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">PayTo</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          {companyId && <NotificationBell companyId={companyId} />}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                Editar perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}