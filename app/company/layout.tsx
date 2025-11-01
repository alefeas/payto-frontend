import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout"

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
