"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Check, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { taskService, type Task } from "@/services/task.service"

export default function TasksPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: ''
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadTasks()
    }
  }, [isAuthenticated, authLoading, router])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const data = await taskService.getTasks()
      setTasks(data)
    } catch (error) {
      toast.error('Error al cargar tareas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('El título es obligatorio')
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
      
      setShowDialog(false)
      setEditingTask(null)
      setFormData({ title: '', description: '', priority: 'medium', due_date: '' })
      loadTasks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar tarea')
    } finally {
      setIsSubmitting(false)
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

  const handleDelete = async (id: string) => {
    if (deletingIds.has(id)) return
    
    try {
      setDeletingIds(prev => new Set(prev).add(id))
      await taskService.deleteTask(id)
      toast.success('Tarea eliminada')
      loadTasks()
    } catch (error) {
      toast.error('Error al eliminar tarea')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    })
    setShowDialog(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
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

  const pendingTasks = tasks.filter(t => !t.is_completed)
  const completedTasks = tasks.filter(t => t.is_completed)
  const selectedPendingCount = Array.from(selectedTasks).filter(id => pendingTasks.some(t => t.id === id)).length
  const selectedCompletedCount = Array.from(selectedTasks).filter(id => completedTasks.some(t => t.id === id)).length

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Mis Tareas</h1>
            <p className="text-muted-foreground">Organiza y gestiona tus tareas pendientes</p>
          </div>
          <Button onClick={() => {
            setEditingTask(null)
            setFormData({ title: '', description: '', priority: 'medium', due_date: '' })
            setShowDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pendientes ({pendingTasks.length})
                </CardTitle>
                <CardDescription>Tareas por completar</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes tareas pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedPendingCount > 0 && (
                      <div className="flex items-center justify-between p-3 bg-muted border rounded-lg">
                        <span className="text-sm">{selectedPendingCount} seleccionada(s)</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedTasks(new Set())} disabled={isBulkUpdating}>
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleBulkComplete} disabled={isBulkUpdating}>
                            {isBulkUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Completar'}
                          </Button>
                        </div>
                      </div>
                    )}
                    {pendingTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleToggleSelection(task.id)}
                      >
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={() => handleToggleSelection(task.id)}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium break-words">{task.title}</h3>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {getPriorityLabel(task.priority)}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground break-words">{task.description}</p>
                          )}
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              Vence: {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(task)} disabled={isBulkUpdating}>
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)} disabled={deletingIds.has(task.id) || isBulkUpdating}>
                            {deletingIds.has(task.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {completedTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Completadas ({completedTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedCompletedCount > 0 && (
                      <div className="flex items-center justify-between p-3 bg-muted border rounded-lg">
                        <span className="text-sm">{selectedCompletedCount} seleccionada(s)</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedTasks(new Set())} disabled={isBulkUpdating}>
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleBulkComplete} disabled={isBulkUpdating}>
                            {isBulkUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Reabrir'}
                          </Button>
                        </div>
                      </div>
                    )}
                    {completedTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50 opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                        onClick={() => handleToggleSelection(task.id)}
                      >
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={() => handleToggleSelection(task.id)}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium line-through break-words">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground break-words">{task.description}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} disabled={deletingIds.has(task.id) || isBulkUpdating}>
                          {deletingIds.has(task.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
              <DialogDescription>
                {editingTask ? 'Modifica los detalles de la tarea' : 'Crea una nueva tarea para organizar tu trabajo'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Revisar facturas pendientes"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Detalles adicionales..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
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

                <div className="space-y-2">
                  <Label>Fecha límite</Label>
                  <DatePicker
                    date={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={(date) => setFormData({...formData, due_date: date ? date.toISOString().split('T')[0] : ''})}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingTask ? 'Guardando...' : 'Creando...'}
                    </>
                  ) : (
                    editingTask ? 'Guardar' : 'Crear Tarea'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
