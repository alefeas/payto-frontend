"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/global/navbar"
import Footer from "@/components/landing/footer"

export default function NotFound() {
  const router = useRouter()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white flex items-center justify-center pt-20 p-4 relative overflow-hidden">
        {/* Decorative elements - subtle circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          {/* Card with glass-morphism effect */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 md:p-12">
            <div className="text-center space-y-8">
              {/* 404 Number with icon */}
              <div className="relative">
                <h1 className="text-[120px] md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground/80 to-foreground/60 leading-none select-none">
                  404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-full p-4">
                    <Search className="h-20 w-20 md:h-28 md:w-28 text-primary/40 animate-search-scan" />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-3 px-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Página no encontrada
                </h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
                  Parece que te perdiste. La página que buscás no existe o fue movida a otra ubicación.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver atrás
                </Button>
                <Link href="/" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2">
                    <Home className="h-4 w-4" />
                    Ir al inicio
                  </Button>
                </Link>
              </div>

              {/* Help text */}
              <p className="text-sm text-muted-foreground px-4">
                Si creés que esto es un error,{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  contactá al soporte
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
