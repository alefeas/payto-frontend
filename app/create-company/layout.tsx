import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout"

export default function CreateCompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
