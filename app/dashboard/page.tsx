"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
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
import { parseDateLocal } from "@/lib/utils"
import type { CompanyRole } from "@/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const router = useRouter()

  // Memoización de cálculos pesados
  const taskStats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(task => task.is_completed).length
    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { total, completed, pending, completionRate }
  }, [tasks])

  const recentTasks = useMemo(() => {
    return tasks
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [tasks])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/log-in')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadCompanies()
      loadTasks()
    }
  }, [isAuthenticated])

  const loadCompanies = useCallback(async () => {
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
  }, [isAuthenticated])

  const loadTasks = useCallback(async () => {
    try {
      setLoadingTasks(true)
      const data = await taskService.getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoadingTasks(false)
    }
  }, [])

  const handleToggleSelection = useCallback((taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }, [])

  const handleBulkComplete = useCallback(async () => {
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
  }, [selectedTasks, isBulkUpdating, tasks, loadTasks])

  if (isLoading || !isAuthenticated || loadingCompanies) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section Skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
            <div className="flex justify-center items-center gap-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          
          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Activity Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Skeleton className="h-8 w-16 mx-auto" />
                      <Skeleton className="h-3 w-24 mx-auto mt-2" />
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Skeleton className="h-8 w-16 mx-auto" />
                      <Skeleton className="h-3 w-24 mx-auto mt-2" />
                    </div>
                  </div>
                  
                  {/* Recent Activity */}
                  <div>
                    <Skeleton className="h-4 w-32 mb-3" />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                          <Skeleton className="h-2 w-2 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-2 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Companies & Tasks Skeleton */}
            <div className="space-y-6">
              {/* Companies Card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-2 w-24" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
              
              {/* Tasks Card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Buenos días' : currentHour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="min-h-screen p-6 space-y-8">
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
                    <p className="text-2xl font-bold text-blue-600">{taskStats.total}</p>
                    <p className="text-xs text-muted-foreground">Tareas Totales</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{taskStats.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">Completadas</p>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div>
                  <h4 className="font-medium mb-3 text-sm">Tareas Recientes</h4>
                  <div className="space-y-2">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className={`h-2 w-2 rounded-full ${task.is_completed ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.due_date ? `Vence: ${parseDateLocal(task.due_date)?.toLocaleDateString('es-AR')}` : 'Sin fecha límite'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {recentTasks.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No hay tareas recientes</p>
                    )}
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
                  {companies.filter(c => c.role?.toLowerCase() === 'administrator').length}
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
                  {taskStats.pending === 0 ? (
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
                            <Button size="sm" variant="outline" onClick={() => setSelectedTasks(new Set())} disabled={isBulkUpdating}>
                              Cancelar
                            </Button>
                            <Button size="sm" onClick={handleBulkComplete} disabled={isBulkUpdating}>
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
                                Vence: {parseDateLocal(task.due_date)?.toLocaleDateString('es-AR')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {taskStats.pending > 5 && (
                        <div className="pt-2 text-center">
                          <Button variant="link" size="sm" onClick={() => router.push('/tasks')}>
                            Ver {taskStats.pending - 5} más
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