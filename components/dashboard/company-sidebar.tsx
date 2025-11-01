"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { 
  Building2, 
  FileText, 
  Upload, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Network, 
  Settings, 
  Bell,
  BookOpen,
  DollarSign,
  UserCheck,
  ChevronRight,
  Home,
  LogOut,
  User,
  Shield,
  Plus,
  UserPlus,
  Search,
  PanelLeftClose,
  PanelLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { companyService, Company } from "@/services/company.service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NavItem {
  label: string
  icon: any
  href: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

export function CompanySidebar() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['General', 'Facturación']))
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isAuthenticated) {
      loadCompanies()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const match = pathname.match(/\/company\/([^/]+)/)
    if (match && match[1]) {
      setSelectedCompanyId(match[1])
    }
  }, [pathname])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const data = await companyService.getCompanies()
      const active = data.filter(c => c.isActive)
      setCompanies(active)
      if (active.length > 0) {
        setSelectedCompanyId(active[0].id)
      }
    } catch (error: any) {
      toast.error('Error al cargar perfiles')
    } finally {
      setLoading(false)
    }
  }

  const selectedCompany = companies.find(c => c.id === selectedCompanyId)

  const navSections: NavSection[] = [
    {
      title: "General",
      items: [
        { label: "Inicio", icon: Home, href: selectedCompanyId ? `/company/${selectedCompanyId}` : "#" },
        { label: "Notificaciones", icon: Bell, href: selectedCompanyId ? `/company/${selectedCompanyId}/notifications` : "#" },
        { label: "Centro de Tareas", icon: CheckCircle, href: selectedCompanyId ? `/company/${selectedCompanyId}/task-center` : "#" },
      ]
    },
    {
      title: "Facturación",
      items: [
        { label: "Emitir Factura", icon: FileText, href: selectedCompanyId ? `/company/${selectedCompanyId}/emit-invoice` : "#" },
        { label: "Cargar Factura", icon: Upload, href: selectedCompanyId ? `/company/${selectedCompanyId}/load-invoice` : "#" },
        { label: "Mis Facturas", icon: BookOpen, href: selectedCompanyId ? `/company/${selectedCompanyId}/invoices` : "#" },
        { label: "Aprobar Facturas", icon: UserCheck, href: selectedCompanyId ? `/company/${selectedCompanyId}/approve-invoices` : "#" },
      ]
    },
    {
      title: "Cuentas",
      items: [
        { label: "Cuentas por Cobrar", icon: TrendingUp, href: selectedCompanyId ? `/company/${selectedCompanyId}/accounts-receivable` : "#" },
        { label: "Cuentas por Pagar", icon: DollarSign, href: selectedCompanyId ? `/company/${selectedCompanyId}/accounts-payable` : "#" },
      ]
    },
    {
      title: "Contactos",
      items: [
        { label: "Clientes", icon: Users, href: selectedCompanyId ? `/company/${selectedCompanyId}/clients` : "#" },
        { label: "Proveedores", icon: Building2, href: selectedCompanyId ? `/company/${selectedCompanyId}/suppliers` : "#" },
        { label: "Red PayTo", icon: Network, href: selectedCompanyId ? `/company/${selectedCompanyId}/network` : "#" },
      ]
    },
    {
      title: "Reportes",
      items: [
        { label: "Analíticas", icon: TrendingUp, href: selectedCompanyId ? `/company/${selectedCompanyId}/analytics` : "#" },
        { label: "Libro IVA", icon: BookOpen, href: selectedCompanyId ? `/company/${selectedCompanyId}/iva-book` : "#" },
        { label: "Auditoría", icon: FileText, href: selectedCompanyId ? `/company/${selectedCompanyId}/audit-log` : "#" },
      ]
    },
    {
      title: "Configuración",
      items: [
        { label: "Certificado AFIP", icon: Shield, href: selectedCompanyId ? `/company/${selectedCompanyId}/verify` : "#" },
        { label: "Miembros", icon: Users, href: selectedCompanyId ? `/company/${selectedCompanyId}/members` : "#" },
        { label: "Ajustes", icon: Settings, href: selectedCompanyId ? `/company/${selectedCompanyId}/settings` : "#" },
      ]
    }
  ]

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nationalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.national_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    router.push('/')
  }

  const isActive = (href: string) => pathname === href

  return (
    <aside className={cn(
      "border-r bg-background h-screen flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-72"
    )}>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Image
              src="/brand/payto.png"
              alt="PayTo"
              width={100}
              height={100}
              className="h-8 w-auto object-contain cursor-pointer"
              onClick={() => router.push('/dashboard')}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        {!isCollapsed && <Separator />}

        {!isCollapsed && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => router.push('/create-company')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Registrar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => router.push('/join-company')}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Unirse
              </Button>
            </div>

            {/* Company Selector */}
            <div>
              <Select
                value={selectedCompanyId}
                onValueChange={(value) => {
                  setSelectedCompanyId(value)
                  setSearchTerm('')
                }}
                disabled={loading || companies.length === 0}
                onOpenChange={(open) => !open && setSearchTerm('')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar perfil"} />
                </SelectTrigger>
                <SelectContent>
                  {companies.length > 0 && (
                    <div className="px-2 pb-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Buscar..."
                          value={searchTerm}
                          onChange={(e) => {
                            e.stopPropagation()
                            setSearchTerm(e.target.value)
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full h-7 pl-7 pr-2 text-xs border rounded-md outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  )}
                  {filteredCompanies.length === 0 ? (
                    <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                      No se encontraron perfiles
                    </div>
                  ) : (
                    filteredCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span className="truncate font-medium">{company.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground ml-6">
                            CUIT: {company.nationalId || company.national_id}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Navigation Sections */}
            {selectedCompanyId && (
              <nav className="space-y-2">
                {navSections.map((section) => (
                  <div key={section.title}>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between px-2 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span>{section.title}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedSections.has(section.title) && "rotate-90"
                        )}
                      />
                    </button>
                    {expandedSections.has(section.title) && (
                      <div className="space-y-1 mt-1">
                        {section.items.map((item) => (
                          <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-sm h-9",
                              isActive(item.href) && "bg-muted"
                            )}
                            onClick={() => router.push(item.href)}
                          >
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )}

            {!selectedCompanyId && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay perfiles disponibles</p>
              </div>
            )}
          </>
        )}

        {isCollapsed && selectedCompanyId && (
          <div className="space-y-2 mt-4">
            {navSections.flatMap(section => section.items).map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-10",
                  isActive(item.href) && "bg-muted"
                )}
                onClick={() => router.push(item.href)}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        )}
        </div>
      </ScrollArea>

      {/* User Menu */}
      <div className="p-4 border-t">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-9"
                onClick={() => router.push('/profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Editar perfil
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-9 text-destructive hover:text-destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10"
              onClick={() => router.push('/profile')}
              title="Editar perfil"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10 text-destructive hover:text-destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
