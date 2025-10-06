import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary">PayTo</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Sistema de gestión de workspaces empresariales y facturación
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Iniciar Sesión</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">Registrarse</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
