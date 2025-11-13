"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CardCarouselProps {
  children: React.ReactNode[]
  className?: string
  desktopCols?: 2 | 3 | 4
  mobileBreakpoint?: 'sm' | 'md' | 'lg'
}

export function CardCarousel({ 
  children, 
  className = "", 
  desktopCols = 3,
  mobileBreakpoint = 'md'
}: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Responsive breakpoints
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024
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

  // Desktop grid classes
  const desktopGridClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3', 
    4: 'md:grid-cols-4'
  }[desktopCols]

  if (!isMobile) {
    // Desktop: Normal grid layout
    return (
      <div className={cn(`grid grid-cols-1 ${desktopGridClass} gap-6`, className)}>
        {children}
      </div>
    )
  }

  // Mobile: Fade carousel (sin translateX)
  return (
    <div className={cn("relative w-full", className)}>
      {/* Carousel Container - Usa posición relativa y opacidad */}
      <div 
        className="relative w-full"
        style={{ minHeight: '200px' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className={cn(
              "w-full transition-opacity duration-300 ease-in-out",
              index === currentIndex ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"
            )}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {totalCards > 1 && (
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center space-x-3">
            {/* Previous Arrow */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-white shadow-sm border-gray-200 hover:bg-gray-50 flex-shrink-0"
              onClick={goToPrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex space-x-1.5">
              {Array.from({ length: totalCards }).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors duration-200",
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
              className="h-8 w-8 rounded-full bg-white shadow-sm border-gray-200 hover:bg-gray-50 flex-shrink-0"
              onClick={goToNext}
              disabled={currentIndex === maxIndex}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}