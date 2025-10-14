import apiClient from '@/lib/api-client'

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

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get('/tasks')
    return response.data
  },

  async createTask(data: { title: string; description?: string; priority: string; due_date?: string }) {
    const response = await apiClient.post('/tasks', data)
    return response.data
  },

  async updateTask(id: string, data: Partial<Task>) {
    const response = await apiClient.put(`/tasks/${id}`, data)
    return response.data
  },

  async deleteTask(id: string) {
    const response = await apiClient.delete(`/tasks/${id}`)
    return response.data
  },
}
