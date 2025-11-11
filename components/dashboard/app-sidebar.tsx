"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
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
  Home,
  LogOut,
  User,
  Shield,
  Plus,
  UserPlus,
  ChevronsUpDown,
  Check,
  ChevronRight,
  Search,
  CheckSquare,
  BarChart3,
  ClipboardCheck,
  Truck,
  UserCog
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { companyService, Company } from "@/services/company.service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isAuthenticated) {
      // Extraer companyId de la URL si existe
      const pathMatch = pathname.match(/\/company\/([^/]+)/)
      const urlCompanyId = pathMatch ? pathMatch[1] : null
      loadCompanies(urlCompanyId || undefined)
    }
  }, [isAuthenticated, pathname])

  const loadCompanies = async (selectCompanyId?: string) => {
    try {
      setLoading(true)
      const data = await companyService.getCompanies()
      const active = data.filter(c => c.isActive)
      setCompanies(active)
      
      // Si se especifica un ID, seleccionarlo
      if (selectCompanyId) {
        setSelectedCompanyId(selectCompanyId)
      } 
      // Si no hay empresa seleccionada y hay empresas disponibles, seleccionar la primera
      else if (active.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(active[0].id)
      }
    } catch (error: any) {
      toast.error("Error al cargar perfiles")
    } finally {
      setLoading(false)
    }
  }

  // Exponer función para recargar empresas desde fuera
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).reloadCompanies = (newCompanyId?: string) => {
        loadCompanies(newCompanyId)
      }
    }
  }, [loadCompanies])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    router.push("/")
  }

  const selectedCompany = companies.find(c => c.id === selectedCompanyId)

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(label)) {
        newSet.delete(label)
      } else {
        newSet.add(label)
      }
      return newSet
    })
  }

  const navGroups = [
    {
      label: "General",
      items: [
        { title: "Inicio", icon: Home, url: `/company/${selectedCompanyId}` },
        { title: "Notificaciones", icon: Bell, url: `/company/${selectedCompanyId}/notifications` },
      ]
    },
    {
      label: "Facturación",
      items: [
        { title: "Emitir Factura", icon: FileText, url: `/company/${selectedCompanyId}/emit-invoice` },
        { title: "Cargar Factura", icon: Upload, url: `/company/${selectedCompanyId}/load-invoice` },
        { title: "Mis Facturas", icon: BookOpen, url: `/company/${selectedCompanyId}/invoices` },
        { title: "Aprobar Facturas", icon: UserCheck, url: `/company/${selectedCompanyId}/approve-invoices` },
      ]
    },
    {
      label: "Cuentas",
      items: [
        { title: "Cuentas por Cobrar", icon: TrendingUp, url: `/company/${selectedCompanyId}/accounts-receivable` },
        { title: "Cuentas por Pagar", icon: DollarSign, url: `/company/${selectedCompanyId}/accounts-payable` },
      ]
    },
    {
      label: "Contactos",
      items: [
        { title: "Clientes", icon: Users, url: `/company/${selectedCompanyId}/clients` },
        { title: "Proveedores", icon: Truck, url: `/company/${selectedCompanyId}/suppliers` },
        { title: "Red PayTo", icon: Network, url: `/company/${selectedCompanyId}/network` },
      ]
    },
    {
      label: "Reportes",
      items: [
        { title: "Analíticas", icon: BarChart3, url: `/company/${selectedCompanyId}/analytics` },
        { title: "Libro IVA", icon: BookOpen, url: `/company/${selectedCompanyId}/iva-book` },
        { title: "Auditoría", icon: ClipboardCheck, url: `/company/${selectedCompanyId}/audit-log` },
      ]
    },
    {
      label: "Configuración",
      items: [
        { title: "Certificado AFIP", icon: Shield, url: `/company/${selectedCompanyId}/verify` },
        { title: "Miembros", icon: UserCog, url: `/company/${selectedCompanyId}/members` },
        { title: "Ajustes", icon: Settings, url: `/company/${selectedCompanyId}/settings` },
      ]
    }
  ]

  if (loading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between px-2 py-3 group-data-[collapsible=icon]:justify-center">
            <Image
              src="/brand/payto.png"
              alt="PayTo"
              width={100}
              height={100}
              className="h-8 w-auto object-contain cursor-pointer group-data-[collapsible=icon]:hidden"
              onClick={() => router.push("/dashboard")}
            />
            <SidebarTrigger className="group-data-[collapsible=icon]:mx-auto" />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <Skeleton className="h-14 w-full rounded-lg" />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-2 p-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </SidebarContent>
        <div className="mx-2 my-2 h-px bg-gray-200" />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Skeleton className="h-14 w-full rounded-lg" />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-3 group-data-[collapsible=icon]:justify-center">
          <Image
            src="/brand/payto.png"
            alt="PayTo"
            width={100}
            height={100}
            className="h-8 w-auto object-contain cursor-pointer group-data-[collapsible=icon]:hidden"
            onClick={() => router.push("/dashboard")}
          />
          <SidebarTrigger className="group-data-[collapsible=icon]:mx-auto" />
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:!bg-accent/50 transition-all duration-200 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-full before:w-1 before:bg-blue-600 dark:before:bg-blue-400 before:rounded-r-full before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:duration-300 before:origin-left"
                  disabled={loading}
                  tooltip={selectedCompany?.name || "Seleccionar perfil"}
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {loading ? "Cargando..." : (selectedCompany?.name || "Seleccionar")}
                    </span>
                    <span className="truncate text-xs">
                      {loading ? "" : (selectedCompany?.nationalId || selectedCompany?.national_id || "Sin CUIT")}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-72 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                  Perfiles Fiscales
                </DropdownMenuLabel>
                {companies.length > 3 && (
                  <div className="px-2 pb-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                      <Input
                        type="text"
                        placeholder="Buscar perfil..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9 bg-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredCompanies.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No se encontraron perfiles
                    </div>
                  ) : (
                    filteredCompanies.map((company) => (
                      <DropdownMenuItem
                        key={company.id}
                        onClick={() => {
                          setSelectedCompanyId(company.id)
                          setSearchTerm("")
                          router.push(`/company/${company.id}`)
                          toast.success(`Cambiaste a "${company.name}"`)
                        }}
                        className="gap-2 p-2 cursor-pointer transition-colors hover:bg-accent"
                      >
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <Building2 className="size-4 shrink-0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{company.name}</div>
                          <div className="text-xs text-muted-foreground truncate">CUIT: {company.nationalId || company.national_id}</div>
                        </div>
                        {company.id === selectedCompanyId && <Check className="size-4 shrink-0" />}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/create-company")}>
                  <Plus className="size-4 mr-2" />
                  Registrar Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/join-company")}>
                  <UserPlus className="size-4 mr-2" />
                  Unirse como Miembro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <div className="mx-2 my-2 h-px bg-gray-200" />

      <SidebarContent>
        {selectedCompanyId && (
          <>
            {/* Vista expandida con grupos */}
            <div className="group-data-[collapsible=icon]:hidden">
              {navGroups.map((group) => (
                <Collapsible
                  key={group.label}
                  open={expandedGroups.has(group.label)}
                  onOpenChange={() => toggleGroup(group.label)}
                  className="group/collapsible"
                >
                  <SidebarGroup>
                    <SidebarGroupLabel asChild>
                      <CollapsibleTrigger className="w-full hover:!text-foreground hover:!bg-accent/50 rounded-md transition-all duration-200 flex items-center justify-between py-3.5 pl-5 pr-3 !text-xs font-medium text-muted-foreground/70 relative before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:h-1.5 before:w-1.5 before:bg-blue-600 dark:before:bg-blue-400 before:rounded-full before:scale-0 hover:before:scale-100 data-[state=open]:before:scale-100 before:transition-transform before:duration-300 before:ease-out">
                        <span className="!text-xs">{group.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down transition-all duration-500 ease-out">
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                asChild
                                isActive={pathname === item.url}
                                tooltip={item.title}
                                className="transition-all duration-150 hover:!text-blue-600 dark:hover:!text-blue-400 hover:translate-x-1 !pl-5"
                              >
                                <Link href={item.url}>
                                  <item.icon />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              ))}
            </div>
            
            {/* Vista colapsada solo con iconos */}
            <div className="hidden group-data-[collapsible=icon]:block">
              <SidebarMenu className="items-center">
                {navGroups.flatMap(group => group.items).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </>
        )}
      </SidebarContent>

      <div className="mx-2 my-2 h-px bg-gray-200" />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:!bg-accent/50 transition-all duration-200 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-full before:w-1 before:bg-blue-600 dark:before:bg-blue-400 before:rounded-r-full before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:duration-300 before:origin-left"
                  tooltip={user?.name || "Menú de usuario"}
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name}</span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="size-4 mr-2" />
                  Editar perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4 mr-2" />
                  {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
