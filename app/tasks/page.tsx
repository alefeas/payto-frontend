"use client"

import { useEffect, useState } from "react"
import { parseDateLocal } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Plus, Loader2, CheckSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BackButton } from "@/components/ui/back-button"
import { ResponsiveHeading, ResponsiveText } from "@/components/ui/responsive-heading"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/contexts/auth-context"
import { taskService, type Task } from "@/services/task.service"
import { toast } from "sonner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { TaskCard } from "@/components/tasks/TaskCard"
import { TasksPageSkeleton } from "@/components/tasks/TasksSkeleton"
import { Calendar } from "@/components/ui/calendar"

export default function TasksPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: ""
  })
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [isCompletingTasks, setIsCompletingTasks] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/log-in')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
    }
  }, [isAuthenticated])

  const loadTasks = async () => {
    try {
      setLoadingTasks(true)
      const data = await taskService.getTasks()
      setTasks(data)
    } catch (error) {
      toast.error('Error al cargar tareas')
    } finally {
      setLoadingTasks(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('El título es requerido')
      return
    }

    if (!formData.due_date) {
      toast.error('La fecha límite es requerida')
      return
    }

    try {
      setIsSubmitting(true)
      if (editingTask) {
        await taskService.updateTask(editingTask.id, formData)
        toast.success('Tarea actualizada')
      } else {
        await taskService.createTask(formData)
        toast.success('Tarea creada')
      }
      
      setFormData({ title: "", description: "", priority: "medium", due_date: "" })
      setIsCreateDialogOpen(false)
      setEditingTask(null)
      loadTasks()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || (editingTask ? 'Error al actualizar tarea' : 'Error al crear tarea')
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      await taskService.updateTask(task.id, { is_completed: !task.is_completed })
      loadTasks()
      toast.success(task.is_completed ? 'Tarea marcada como pendiente' : 'Tarea completada')
    } catch (error) {
      toast.error('Error al actualizar tarea')
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId)
      loadTasks()
      toast.success('Tarea eliminada')
    } catch (error) {
      toast.error('Error al eliminar tarea')
    }
  }

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    const task = tasks.find(t => t.id === taskId)
    
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      if (task) {
        const firstSelectedTask = selectedTasks.size > 0 ? tasks.find(t => t.id === Array.from(selectedTasks)[0]) : null
        if (firstSelectedTask && firstSelectedTask.is_completed !== task.is_completed) {
          toast.error('No puedes mezclar tareas completadas y pendientes')
          return
        }
      }
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleCompleteSelected = async () => {
    if (selectedTasks.size === 0) return
    
    try {
      setIsCompletingTasks(true)
      const firstTask = tasks.find(t => t.id === Array.from(selectedTasks)[0])
      const newCompletedState = !firstTask?.is_completed
      
      await Promise.all(
        Array.from(selectedTasks).map(taskId => {
          return taskService.updateTask(taskId, { is_completed: newCompletedState })
        })
      )
      setSelectedTasks(new Set())
      loadTasks()
      const action = newCompletedState ? 'completada(s)' : 'descompletada(s)'
      toast.success(`${selectedTasks.size} tarea(s) ${action}`)
    } catch (error) {
      toast.error('Error al actualizar tareas')
    } finally {
      setIsCompletingTasks(false)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ""
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", priority: "medium", due_date: "" })
    setEditingTask(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return priority
    }
  }

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending': return !task.is_completed
      case 'completed': return task.is_completed
      default: return true
    }
  })

  if (!isAuthenticated) {
    return null
  }

  if (isLoading || loadingTasks) {
    return (
      <SidebarInset>
        <TasksPageSkeleton />
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
        <div className="min-h-screen bg-white p-2 sm:p-3 md:p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <BackButton href="/dashboard" />
            <div className="flex-1 min-w-0">
              <ResponsiveHeading level="h1">Mis Tareas</ResponsiveHeading>
              <ResponsiveText className="text-muted-foreground mt-1">Gestiona tu lista de tareas pendientes</ResponsiveText>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (!open) {
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex-shrink-0 md:flex hidden">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Modifica los detalles de tu tarea' : 'Crea una nueva tarea para tu lista'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-2 block">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título de la tarea"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2 block">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción opcional"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority" className="mb-2 block">Prioridad</Label>
                    <Select value={formData.priority} onValueChange={(value: "low" | "medium" | "high") => 
                      setFormData(prev => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="due_date" className="mb-2 block">Fecha límite</Label>
                    <DatePicker
                      date={formData.due_date ? new Date(formData.due_date + 'T00:00:00') : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear()
                          const month = String(date.getMonth() + 1).padStart(2, '0')
                          const day = String(date.getDate()).padStart(2, '0')
                          setFormData(prev => ({ ...prev, due_date: `${year}-${month}-${day}` }))
                        } else {
                          setFormData(prev => ({ ...prev, due_date: '' }))
                        }
                      }}
                      placeholder="Seleccionar fecha"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !formData.title.trim() || !formData.due_date}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingTask ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>{editingTask ? 'Actualizar' : 'Crear'} Tarea</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "pending" | "completed")}>
          {/* Desktop: Tabs con ancho fijo, botón Completar a la derecha */}
          <div className="hidden md:flex items-center w-full">
            <TabsList>
              <TabsTrigger value="all">Todas ({tasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pendientes ({tasks.filter(t => !t.is_completed).length})</TabsTrigger>
              <TabsTrigger value="completed">Completadas ({tasks.filter(t => t.is_completed).length})</TabsTrigger>
            </TabsList>
            <div className="flex-1" />
            <Button 
              variant="outline"
              onClick={handleCompleteSelected}
              disabled={selectedTasks.size === 0 || isCompletingTasks}
              className="flex-shrink-0"
            >
              {isCompletingTasks ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {selectedTasks.size > 0 && tasks.find(t => t.id === Array.from(selectedTasks)[0])?.is_completed ? 'Desmarcando...' : 'Completando...'}
                </>
              ) : (
                <>
                  {selectedTasks.size > 0 && tasks.find(t => t.id === Array.from(selectedTasks)[0])?.is_completed ? 'Desmarcar' : 'Completar'} ({selectedTasks.size})
                </>
              )}
            </Button>
          </div>

          {/* Mobile: Tabs arriba, botones abajo */}
          <div className="md:hidden flex flex-col gap-3">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all" className="flex-1">Todas ({tasks.length})</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">Pendientes ({tasks.filter(t => !t.is_completed).length})</TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">Completadas ({tasks.filter(t => t.is_completed).length})</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleCompleteSelected}
                disabled={selectedTasks.size === 0 || isCompletingTasks}
                className="flex-1"
              >
                {isCompletingTasks ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {selectedTasks.size > 0 && tasks.find(t => t.id === Array.from(selectedTasks)[0])?.is_completed ? 'Desmarcando...' : 'Completando...'}
                  </>
                ) : (
                  <>
                    {selectedTasks.size > 0 && tasks.find(t => t.id === Array.from(selectedTasks)[0])?.is_completed ? 'Desmarcar' : 'Completar'} ({selectedTasks.size})
                  </>
                )}
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open)
                if (!open) {
                  resetForm()
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="h-12 w-12 p-0 flex-shrink-0">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
          <TabsContent value={filter} className="mt-4 sm:mt-6">

            {/* Tasks List */}
            <div className="space-y-2 sm:space-y-3">
          {loadingTasks ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#0078ff] mx-auto" />
              <p className="text-gray-500 mt-2">Cargando tareas...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="text-center py-12">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  {filter === "all" ? "No tienes tareas" : 
                   filter === "pending" ? "No tienes tareas pendientes" : 
                   "No tienes tareas completadas"}
                </h3>
                <p className="text-gray-500 mb-4 font-light">
                  {filter === "all" ? "Crea tu primera tarea para comenzar" : 
                   filter === "pending" ? "¡Excelente! Has completado todas tus tareas" : 
                   "Completa algunas tareas para verlas aquí"}
                </p>
                {filter === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#0078ff] hover:bg-[#0066dd]">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primera tarea
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={selectedTasks.has(task.id)}
                onToggleSelect={toggleTaskSelection}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getPriorityColor={getPriorityColor}
                getPriorityLabel={getPriorityLabel}
              />
            ))
            )}
            </div>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </SidebarInset>
  )
}