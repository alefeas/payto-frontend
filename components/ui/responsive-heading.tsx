"use client"

import { cn } from "@/lib/utils"
import { getResponsiveFontSize } from "@/styles"

interface ResponsiveHeadingProps {
  level: 'hero' | 'h1' | 'h2' | 'h3'
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function ResponsiveHeading({ 
  level, 
  children, 
  className = "", 
  as 
}: ResponsiveHeadingProps) {
  const Component = as || (level === 'hero' ? 'h1' : level)
  
  return (
    <Component 
      className={cn(
        getResponsiveFontSize(level),
        "font-medium text-gray-900 break-words",
        className
      )}
    >
      {children}
    </Component>
  )
}

interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'base' | 'lg'
}

export function ResponsiveText({ 
  children, 
  className = "",
  size = 'base'
}: ResponsiveTextProps) {
  const sizeClasses = {
    sm: "text-xs md:text-sm",
    base: "text-sm md:text-base", 
    lg: "text-base md:text-lg"
  }
  
  return (
    <p className={cn(
      sizeClasses[size],
      "text-gray-500 font-light break-words",
      className
    )}>
      {children}
    </p>
  )
}