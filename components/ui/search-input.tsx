"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  debounceMs?: number
  showClearButton?: boolean
}

export function SearchInput({
  value,
  onChange,
  onClear,
  debounceMs = 300,
  showClearButton = true,
  className,
  placeholder = "Buscar...",
  ...props
}: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [localValue, debounceMs, onChange, value])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    onClear?.()
  }

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        {...props}
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => {
          const newValue = e.target.value
          setLocalValue(newValue)
        }}
        className={cn("pl-10 pr-10", className)}
      />
      {showClearButton && localValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}


