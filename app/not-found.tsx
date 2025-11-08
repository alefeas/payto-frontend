"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-400/10 dark:bg-slate-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-400/10 dark:bg-slate-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto">
        {/* 404 Number with animation */}
        <div className="relative">
          <h1 className="text-[180px] md:text-[240px] font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-slate-100 dark:via-slate-300 dark:to-slate-500 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-20 w-20 md:h-28 md:w-28 text-slate-400/40 dark:text-slate-600/40 animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Página no encontrada
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Parece que te perdiste. La página que buscás no existe o fue movida a otra ubicación.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver atrás
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg">
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
          </Link>
        </div>

        {/* Help text */}
        <p className="text-sm text-slate-500 dark:text-slate-500 px-4">
          Si creés que esto es un error, contactá al soporte.
        </p>
      </div>
    </div>
  )
}
