"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Building2, 
  Clock,
  Users,
  Bell,
  Target,
  CheckSquare,
  ArrowRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { companyService, Company } from "@/services/company.service"
import { taskService, type Task } from "@/services/task.service"
import { toast } from "sonner"
import { translateRole } from "@/lib/role-utils"
import { translateTaxCondition } from "@/lib/tax-condition-utils"
import type { CompanyRole } from "@/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadCompanies()
      loadTasks()
    }
  }, [isAuthenticated])

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const data = await companyService.getCompanies()
      setCompanies(data)
    } catch (error: any) {
      // Solo mostrar error si el usuario está autenticado
      if (isAuthenticated) {
        toast.error('Error al cargar perfiles')
      }
    } finally {
      setLoadingCompanies(false)
    }
  }

  const loadTasks = async () => {
    try {
      setLoadingTasks(true)
      const data = await taskService.getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoadingTasks(false)
    }
  }

  const handleToggleSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleBulkComplete = async () => {
    if (selectedTasks.size === 0 || isBulkUpdating) return
    
    try {
      setIsBulkUpdating(true)
      await Promise.all(
        Array.from(selectedTasks).map(taskId => {
          const task = tasks.find(t => t.id === taskId)
          if (task) {
            return taskService.updateTask(taskId, { is_completed: !task.is_completed })
          }
        })
      )
      setSelectedTasks(new Set())
      loadTasks()
      toast.success('Tareas actualizadas')
    } catch (error) {
      toast.error('Error al actualizar tareas')
    } finally {
      setIsBulkUpdating(false)
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
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">156</p>
                    <p className="text-xs text-muted-foreground">Facturas Totales</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-green-600">89</p>
                    <p className="text-xs text-muted-foreground">Pagos Procesados</p>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div>
                  <h4 className="font-medium mb-3 text-sm">Actividad Reciente</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Factura creada</p>
                        <p className="text-xs text-muted-foreground">TechCorp SA • hace 2h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nuevo miembro</p>
                        <p className="text-xs text-muted-foreground">StartupXYZ • hace 1d</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Pago pendiente</p>
                        <p className="text-xs text-muted-foreground">Consulting LLC • hace 2d</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <p className="text-sm text-center">
                    ?? <strong>¡Buen trabajo!</strong> Has gestionado {companies.length} perfiles exitosamente
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
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Perfiles</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{companies.length}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Como Admin</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {companies.filter(c => c.role === 'administrator').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
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



          {/* Mis Tareas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Mis Tareas
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push('/tasks')}>
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">Cargando tareas...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.filter(t => !t.is_completed).slice(0, 5).length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tienes tareas pendientes</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push('/tasks')}>
                        Crear tarea
                      </Button>
                    </div>
                  ) : (
                    <>
                      {selectedTasks.size > 0 && (
                        <div className="flex items-center justify-between p-2 bg-muted border rounded-lg">
                          <span className="text-xs">{selectedTasks.size} seleccionada(s)</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => setSelectedTasks(new Set())} className="h-7 text-xs" disabled={isBulkUpdating}>
                              Cancelar
                            </Button>
                            <Button size="sm" onClick={handleBulkComplete} className="h-7 text-xs" disabled={isBulkUpdating}>
                              {isBulkUpdating ? 'Actualizando...' : 'Completar'}
                            </Button>
                          </div>
                        </div>
                      )}
                      {tasks.filter(t => !t.is_completed).slice(0, 5).map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleToggleSelection(task.id)}
                        >
                          <Checkbox
                            checked={selectedTasks.has(task.id)}
                            onCheckedChange={() => handleToggleSelection(task.id)}
                            className="mt-0.5"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm break-words">{task.title}</p>
                            {task.due_date && (
                              <p className="text-xs text-muted-foreground">
                                Vence: {new Date(task.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {tasks.filter(t => !t.is_completed).length > 5 && (
                        <div className="pt-2 text-center">
                          <Button variant="link" size="sm" onClick={() => router.push('/tasks')}>
                            Ver {tasks.filter(t => !t.is_completed).length - 5} más
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}