'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Eye, Code, Copy, Check } from 'lucide-react'

interface AuditMetadataViewerProps {
  metadata: Record<string, any>
  trigger?: React.ReactNode
}

export function AuditMetadataViewer({ metadata, trigger }: AuditMetadataViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(metadata, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying metadata:', error)
    }
  }

  const renderMetadata = (data: any, level = 0): React.ReactNode => {
    if (data === null || data === undefined) {
      return <span className="text-muted-foreground">null</span>
    }

    if (typeof data === 'boolean') {
      return <Badge variant={data ? 'default' : 'secondary'}>{data.toString()}</Badge>
    }

    if (typeof data === 'number') {
      return <span className="text-blue-600 font-mono">{data}</span>
    }

    if (typeof data === 'string') {
      if (data.length > 100) {
        return (
          <div className="bg-muted p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
            {data}
          </div>
        )
      }
      return <span className="text-green-600">"{data}"</span>
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return <span className="text-muted-foreground">[]</span>
      }
      return (
        <div className="space-y-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground text-xs">[{index}]</span>
              <div className="flex-1">{renderMetadata(item, level + 1)}</div>
            </div>
          ))}
        </div>
      )
    }

    if (typeof data === 'object') {
      const entries = Object.entries(data)
      if (entries.length === 0) {
        return <span className="text-muted-foreground">{}</span>
      }
      return (
        <div className="space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="font-medium text-sm min-w-[120px]">{key}:</span>
              <div className="flex-1">{renderMetadata(value, level + 1)}</div>
            </div>
          ))}
        </div>
      )
    }

    return <span className="text-muted-foreground">{String(data)}</span>
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Eye className="h-3 w-3 mr-1" />
      Ver detalles
    </Button>
  )

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || defaultTrigger}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Metadatos de Auditoría
            </DialogTitle>
            <DialogDescription>
              Información detallada de los cambios realizados
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {Object.keys(metadata).length} campo(s) encontrado(s)
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar JSON
                </>
              )}
            </Button>
          </div>

          <ScrollArea className="h-[400px] w-full rounded-lg border bg-muted/30 p-4">
            <div className="font-mono text-sm">
              {renderMetadata(metadata)}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}