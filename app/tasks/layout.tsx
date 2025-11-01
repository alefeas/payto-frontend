import { Metadata } from 'next'
import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout"

export const metadata: Metadata = {
  title: 'Mis Tareas - PayTo',
  description: 'Gestiona tu lista de tareas pendientes',
}

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}