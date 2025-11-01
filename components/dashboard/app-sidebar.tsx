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
  Home,
  LogOut,
  User,
  Shield,
  Plus,
  UserPlus,
  ChevronsUpDown,
  Check,
  ChevronRight,
  Search
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["General", "Facturación"]))
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isAuthenticated) {
      loadCompanies()
    }
  }, [isAuthenticated])

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
      toast.error("Error al cargar perfiles")
    } finally {
      setLoading(false)
    }
  }

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
        { title: "Centro de Tareas", icon: CheckCircle, url: `/company/${selectedCompanyId}/task-center` },
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
        { title: "Proveedores", icon: Building2, url: `/company/${selectedCompanyId}/suppliers` },
        { title: "Red PayTo", icon: Network, url: `/company/${selectedCompanyId}/network` },
      ]
    },
    {
      label: "Reportes",
      items: [
        { title: "Analíticas", icon: TrendingUp, url: `/company/${selectedCompanyId}/analytics` },
        { title: "Libro IVA", icon: BookOpen, url: `/company/${selectedCompanyId}/iva-book` },
        { title: "Auditoría", icon: FileText, url: `/company/${selectedCompanyId}/audit-log` },
      ]
    },
    {
      label: "Configuración",
      items: [
        { title: "Certificado AFIP", icon: Shield, url: `/company/${selectedCompanyId}/verify` },
        { title: "Miembros", icon: Users, url: `/company/${selectedCompanyId}/members` },
        { title: "Ajustes", icon: Settings, url: `/company/${selectedCompanyId}/settings` },
      ]
    }
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-3">
          <Image
            src="/brand/payto.png"
            alt="PayTo"
            width={100}
            height={100}
            className="h-8 w-auto object-contain cursor-pointer group-data-[collapsible=icon]:hidden"
            onClick={() => router.push("/dashboard")}
          />
          <SidebarTrigger />
        </div>

        {/* Company Switcher */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {selectedCompany?.name || "Seleccionar"}
                    </span>
                    <span className="truncate text-xs">
                      {selectedCompany?.uniqueId || "Sin perfil"}
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
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar perfil..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-8 pl-8 pr-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-primary/20"
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
                        }}
                        className="gap-2 p-2"
                      >
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <Building2 className="size-4 shrink-0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{company.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{company.uniqueId}</div>
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

      <SidebarContent>
        {selectedCompanyId && navGroups.map((group) => (
          <Collapsible
            key={group.label}
            open={expandedGroups.has(group.label)}
            onOpenChange={() => toggleGroup(group.label)}
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full hover:bg-sidebar-accent rounded-md transition-colors flex items-center justify-between">
                  <span>{group.label}</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                          tooltip={item.title}
                        >
                          <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
