"use client"

import { ResponsiveHeading, ResponsiveText } from "@/components/ui/responsive-heading"
import { BackButton } from "@/components/ui/back-button"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  children?: React.ReactNode
  className?: string
  titleLevel?: 'hero' | 'h1' | 'h2' | 'h3'
}

export function PageHeader({ 
  title, 
  description, 
  backHref, 
  children,
  className = "",
  titleLevel = 'h1'
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4", className)}>
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {backHref && <BackButton href={backHref} />}
        <div className="flex-1 min-w-0">
          <ResponsiveHeading level={titleLevel} className="truncate">
            {title}
          </ResponsiveHeading>
          {description && (
            <ResponsiveText className="text-muted-foreground truncate">
              {description}
            </ResponsiveText>
          )}
        </div>
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {children}
        </div>
      )}
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function SectionHeader({ 
  title, 
  description, 
  children,
  className = ""
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", className)}>
      <div>
        <ResponsiveHeading level="h2" as="h2">
          {title}
        </ResponsiveHeading>
        {description && (
          <ResponsiveText className="text-muted-foreground">
            {description}
          </ResponsiveText>
        )}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row gap-2">
          {children}
        </div>
      )}
    </div>
  )
}