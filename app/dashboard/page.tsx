"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Building2, 
  Clock,
  Users,
  Bell,
  Target
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { companyService, Company } from "@/services/company.service"
import { toast } from "sonner"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [tasks, setTasks] = useState<Array<{id: number, text: string, completed: boolean}>>([])
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadCompanies()
    }
  }, [isAuthenticated])

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const data = await companyService.getCompanies()
      setCompanies(data)
    } catch (error: any) {
      toast.error('Error al cargar perfiles')
    } finally {
      setLoadingCompanies(false)
    }
  }

  if (isLoading || !isAuthenticated || loadingCompanies) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-64"></div>
            <div className="h-6 bg-muted rounded w-96"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Buenos días' : currentHour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6 space-y-8">
      {/* Personal Welcome */}
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-4xl font-bold">{greeting}, {user?.name}!</h1>
          <p className="text-lg text-muted-foreground mt-2">Listo para gestionar tus perfiles fiscales hoy</p>
        </div>
        <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{companies.length} perfiles</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Creative Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Combined Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Tu Actividad Total</CardTitle>
              <CardDescription>Resumen de tu trabajo y actividad reciente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Total Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">156</p>
                    <p className="text-xs text-muted-foreground">Facturas Totales</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">89</p>
                    <p className="text-xs text-muted-foreground">Pagos Procesados</p>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div>
                  <h4 className="font-medium mb-3 text-sm">Actividad Reciente</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Factura creada</p>
                        <p className="text-xs text-muted-foreground">TechCorp SA • hace 2h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nuevo miembro</p>
                        <p className="text-xs text-muted-foreground">StartupXYZ • hace 1d</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Pago pendiente</p>
                        <p className="text-xs text-muted-foreground">Consulting LLC • hace 2d</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <p className="text-sm text-center">
                    📈 <strong>¡Buen trabajo!</strong> Has gestionado {companies.length} perfiles exitosamente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Quick Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Resumen Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Perfiles</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{companies.length}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Como Admin</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {companies.filter(c => c.role === 'administrator').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Activos</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {companies.filter(c => c.isActive).length}
                </span>
              </div>
            </CardContent>
          </Card>



          {/* To Do Funcional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Mis Tareas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add Task */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nueva tarea..."
                    className="flex-1 px-3 py-2 text-sm border rounded-md"
                    onKeyPress={(e) => {
                      const target = e.target as HTMLInputElement
                      if (e.key === 'Enter' && target.value.trim()) {
                        const newTask = {
                          id: Date.now(),
                          text: target.value.trim(),
                          completed: false
                        }
                        setTasks([...tasks, newTask])
                        target.value = ''
                      }
                    }}
                  />
                  <button 
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                    onClick={(e) => {
                      const button = e.target as HTMLButtonElement
                      const input = button.parentElement?.querySelector('input') as HTMLInputElement
                      if (input?.value.trim()) {
                        const newTask = {
                          id: Date.now(),
                          text: input.value.trim(),
                          completed: false
                        }
                        setTasks([...tasks, newTask])
                        input.value = ''
                      }
                    }}
                  >
                    +
                  </button>
                </div>
                
                {/* Task List */}
                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tienes tareas pendientes</p>
                      <p className="text-xs">Agrega una tarea para comenzar</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={task.completed}
                          onChange={() => {
                            setTasks(tasks.map(t => 
                              t.id === task.id ? {...t, completed: !t.completed} : t
                            ))
                          }}
                        />
                        <span className={`text-sm flex-1 ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {task.text}
                        </span>
                        <button 
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm"
                          onClick={() => {
                            setTasks(tasks.filter(t => t.id !== task.id))
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                {tasks.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground text-center">
                      {tasks.filter(t => !t.completed).length} de {tasks.length} tareas pendientes
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}