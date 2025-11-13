"use client"

import { useEffect, useState } from "react"
import { parseDateLocal } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Plus, Calendar, CheckSquare, Trash2, Edit3, ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { taskService, type Task } from "@/services/task.service"
import { toast } from "sonner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

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
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return
    
    try {
      await taskService.deleteTask(taskId)
      loadTasks()
      toast.success('Tarea eliminada')
    } catch (error) {
      toast.error('Error al eliminar tarea')
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

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-white p-3 sm:p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium">Mis Tareas</h1>
            <p className="text-gray-500 mt-1 font-light">Gestiona tu lista de tareas pendientes</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#0078ff] hover:bg-[#0066dd]">
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
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título de la tarea"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
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
                    <Label htmlFor="priority">Prioridad</Label>
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
                    <Label htmlFor="due_date">Fecha límite</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
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
                  <Button type="submit" disabled={isSubmitting} className="bg-[#0078ff] hover:bg-[#0066dd]">
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

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-[#0078ff] hover:bg-[#0066dd]" : ""}
          >
            Todas ({tasks.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? "bg-[#0078ff] hover:bg-[#0066dd]" : ""}
          >
            Pendientes ({tasks.filter(t => !t.is_completed).length})
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
            className={filter === "completed" ? "bg-[#0078ff] hover:bg-[#0066dd]" : ""}
          >
            Completadas ({tasks.filter(t => t.is_completed).length})
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
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
              <Card key={task.id} className={`border-gray-200 transition-all hover:shadow-md ${task.is_completed ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={() => handleToggleComplete(task)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-medium text-base ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className={`text-sm mt-1.5 ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-3">
                            <Badge className={getPriorityColor(task.priority)}>
                              {getPriorityLabel(task.priority)}
                            </Badge>
                            {task.due_date && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Calendar className="h-3.5 w-3.5" />
                                {parseDateLocal(task.due_date)?.toLocaleDateString('es-AR')}
                              </div>
                            )}
                            {task.completed_at && (
                              <div className="flex items-center gap-1.5 text-xs text-green-600">
                                <CheckSquare className="h-3.5 w-3.5" />
                                Completada {parseDateLocal(task.completed_at)?.toLocaleDateString('es-AR')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(task)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}