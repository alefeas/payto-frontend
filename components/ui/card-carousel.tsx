"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CardCarouselProps {
  children: React.ReactNode[]
  className?: string
  desktopCols?: 2 | 3 | 4
  mobileBreakpoint?: 'sm' | 'md' | 'lg' | 'xl'
  minHeight?: string
}

export function CardCarousel({ 
  children, 
  className = "", 
  desktopCols = 3,
  mobileBreakpoint = 'md',
  minHeight = '200px'
}: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Responsive breakpoints - ajustados para activar carousel antes con 4 cards
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  }

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoints[mobileBreakpoint])
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [mobileBreakpoint])

  const totalCards = children.length
  const maxIndex = totalCards - 1

  const goToNext = () => {
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1)
  }

  const goToPrev = () => {
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1)
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentIndex < maxIndex) {
      goToNext()
    } else if (isRightSwipe && currentIndex > 0) {
      goToPrev()
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Desktop grid classes con breakpoints mejorados
  const desktopGridClass = {
    2: mobileBreakpoint === 'sm' ? 'sm:grid-cols-2' : mobileBreakpoint === 'md' ? 'md:grid-cols-2' : mobileBreakpoint === 'lg' ? 'lg:grid-cols-2' : 'xl:grid-cols-2',
    3: mobileBreakpoint === 'sm' ? 'sm:grid-cols-3' : mobileBreakpoint === 'md' ? 'md:grid-cols-3' : mobileBreakpoint === 'lg' ? 'lg:grid-cols-3' : 'xl:grid-cols-3',
    4: mobileBreakpoint === 'sm' ? 'sm:grid-cols-4' : mobileBreakpoint === 'md' ? 'md:grid-cols-4' : mobileBreakpoint === 'lg' ? 'lg:grid-cols-4' : 'xl:grid-cols-4'
  }[desktopCols]

  if (!isMobile) {
    // Desktop: Normal grid layout
    return (
      <div className={cn(`grid grid-cols-1 ${desktopGridClass} gap-3 sm:gap-4 lg:gap-6`, className)}>
        {children}
      </div>
    )
  }

  // Mobile: Fade carousel con altura fija
  return (
    <div className={cn("relative w-full", className)}>
      {/* Carousel Container - altura fija para todas las cards */}
      <div 
        className="relative w-full flex items-stretch"
        style={{ minHeight }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className={cn(
              "w-full transition-opacity duration-300 ease-in-out flex",
              index === currentIndex ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"
            )}
            style={{ minHeight }}
          >
            <div className="w-full" style={{ minHeight }}>
              {child}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {totalCards > 1 && (
        <div className="flex items-center justify-center mt-3 sm:mt-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Previous Arrow */}
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white shadow-sm border-gray-200 hover:bg-gray-50 flex-shrink-0"
              onClick={goToPrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex space-x-1">
              {Array.from({ length: totalCards }).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-colors duration-200",
                    index === currentIndex 
                      ? "bg-blue-600" 
                      : "bg-gray-300 hover:bg-gray-400"
                  )}
                  onClick={() => goToIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Arrow */}
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white shadow-sm border-gray-200 hover:bg-gray-50 flex-shrink-0"
              onClick={goToNext}
              disabled={currentIndex === maxIndex}
            >
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}