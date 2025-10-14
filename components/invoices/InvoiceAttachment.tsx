"use client"

import { useState } from "react"
import { Upload, Download, Trash2, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { invoiceService } from "@/services/invoice.service"
import { toast } from "sonner"

interface InvoiceAttachmentProps {
  companyId: string
  invoiceId: string
  attachmentPath?: string
  attachmentOriginalName?: string
  onUpdate?: () => void
}

export function InvoiceAttachment({
  companyId,
  invoiceId,
  attachmentPath,
  attachmentOriginalName,
  onUpdate
}: InvoiceAttachmentProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      await invoiceService.uploadAttachment(companyId, invoiceId, file)
      toast.success("Archivo adjuntado exitosamente")
      setFile(null)
      onUpdate?.()
    } catch (error: any) {
      toast.error("Error al adjuntar archivo", {
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const blob = await invoiceService.downloadAttachment(companyId, invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = attachmentOriginalName || 'factura.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Archivo descargado")
    } catch (error: any) {
      toast.error("Error al descargar archivo")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Está seguro de eliminar el archivo adjunto?")) return

    setIsDeleting(true)
    try {
      await invoiceService.deleteAttachment(companyId, invoiceId)
      toast.success("Archivo eliminado")
      onUpdate?.()
    } catch (error: any) {
      toast.error("Error al eliminar archivo")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Original
        </CardTitle>
        <CardDescription>
          Adjunte el PDF original de la factura recibida del proveedor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {attachmentPath ? (
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{attachmentOriginalName}</p>
                <p className="text-sm text-muted-foreground">PDF adjunto</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Seleccionar archivo PDF</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {file.name}
                </p>
              )}
            </div>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Adjuntar PDF
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
