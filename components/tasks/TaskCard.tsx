"use client"

import { useState } from "react"
import { Edit3, Trash2, Calendar as CalendarIcon, MoreVertical, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { parseDateLocal } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/services/task.service"

interface TaskCardProps {
  task: Task
  isSelected: boolean
  onToggleSelect: (taskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  getPriorityColor: (priority: string) => string
  getPriorityLabel: (priority: string) => string
}

export function TaskCard({
  task,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  getPriorityColor,
  getPriorityLabel,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="menuitem"]')) {
      return
    }
    onToggleSelect(task.id)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(task.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card 
      className={`border border-[var(--color-gray)] transition-all hover:shadow-sm cursor-pointer ${task.is_completed ? 'opacity-60' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="px-2 sm:px-3 py-1 sm:py-1.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(task.id)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-xs sm:text-sm leading-tight whitespace-normal break-all ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-xs leading-tight mt-1 whitespace-normal break-all ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5 sm:mt-2 flex-wrap">
              <Badge className="bg-gray-200 text-gray-800 text-xs py-0 px-1.5 hover:bg-gray-200">
                {getPriorityLabel(task.priority)}
              </Badge>
              {task.due_date && (
                <div className="flex items-center gap-0.5 text-xs text-gray-600 bg-[var(--color-gray)] px-1.5 py-0.5 rounded">
                  <CalendarIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">{parseDateLocal(task.due_date)?.toLocaleDateString('es-AR')}</span>
                  <span className="sm:hidden">{parseDateLocal(task.due_date)?.toLocaleDateString('es-AR', { month: 'numeric', day: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile: Menú de 3 puntos */}
          <div className="flex md:hidden flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Opciones"
                >
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-red-600" />
                      <span className="text-red-600">Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                      <span className="text-red-600">Eliminar</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop: Botones visibles */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-7 w-7 p-0"
              title="Editar tarea"
            >
              <Edit3 className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-7 w-7 p-0"
              title="Eliminar tarea"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 text-red-600 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-red-600" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
