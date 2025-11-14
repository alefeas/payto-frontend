"use client"

import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Button } from "@/components/ui/button"

function MobileMenuButton() {
  const { setOpenMobile, isMobile } = useSidebar()
  
  if (!isMobile) return null
  
  return (
    <Button
      size="icon"
      className="md:hidden fixed top-4 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
      onClick={() => setOpenMobile(true)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M9 3v18"/>
      </svg>
    </Button>
  )
}

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <MobileMenuButton />
        <main className="flex-1 min-h-screen overflow-x-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
