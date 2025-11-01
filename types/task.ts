export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  is_completed: boolean
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface CreateTaskData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  is_completed?: boolean
}