import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout"

export default function JoinCompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
