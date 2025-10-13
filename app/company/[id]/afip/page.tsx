"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Download, Upload, Key, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { afipCertificateService, AfipCertificate } from "@/services/afip-certificate.service"

export default function AfipConfigPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [certificate, setCertificate] = useState<AfipCertificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [testing, setTesting] = useState(false)
  
  // Generación asistida
  const [generatedCSR, setGeneratedCSR] = useState("")
  
  // Subida asistida
  const [assistedCert, setAssistedCert] = useState("")
  const [assistedPassword, setAssistedPassword] = useState("")
  
  // Subida manual
  const [manualCert, setManualCert] = useState("")
  const [manualKey, setManualKey] = useState("")
  const [manualPassword, setManualPassword] = useState("")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadCertificate()
    }
  }, [isAuthenticated, authLoading, router])

  const loadCertificate = async () => {
    try {
      setLoading(true)
      const cert = await afipCertificateService.getCertificate(companyId)
      setCertificate(cert)
    } catch (error) {
      console.error('Error loading certificate:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCSR = async () => {
    try {
      setGenerating(true)
      const result = await afipCertificateService.generateCSR(companyId)
      setGeneratedCSR(result.csr)
      toast.success('CSR generado exitosamente')
    } catch (error) {
      toast.error('Error al generar CSR')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadCSR = () => {
    const blob = new Blob([generatedCSR], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payto-csr.pem'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUploadAssisted = async () => {
    if (!assistedCert.trim()) {
      toast.error('Ingresa el certificado')
      return
    }
    try {
      setUploading(true)
      const cert = await afipCertificateService.uploadCertificate(
        companyId,
        assistedCert,
        assistedPassword || undefined
      )
      setCertificate(cert)
      setAssistedCert("")
      setAssistedPassword("")
      toast.success('Certificado configurado exitosamente')
    } catch (error) {
      toast.error('Error al subir certificado')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadManual = async () => {
    if (!manualCert.trim() || !manualKey.trim()) {
      toast.error('Ingresa el certificado y la clave privada')
      return
    }
    try {
      setUploading(true)
      const cert = await afipCertificateService.uploadManualCertificate(
        companyId,
        manualCert,
        manualKey,
        manualPassword || undefined
      )
      setCertificate(cert)
      setManualCert("")
      setManualKey("")
      setManualPassword("")
      toast.success('Certificado configurado exitosamente')
    } catch (error) {
      toast.error('Error al subir certificado')
    } finally {
      setUploading(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setTesting(true)
      const result = await afipCertificateService.testConnection(companyId)
      if (result.success) {
        toast.success(result.message, {
          description: result.expires_in_days ? `Expira en ${result.expires_in_days} días` : undefined
        })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Error al probar conexión')
    } finally {
      setTesting(false)
    }
  }

  const handleDeleteCertificate = async () => {
    if (!confirm('¿Estás seguro de eliminar el certificado AFIP?')) return
    
    try {
      await afipCertificateService.deleteCertificate(companyId)
      setCertificate(null)
      toast.success('Certificado eliminado')
    } catch (error) {
      toast.error('Error al eliminar certificado')
    }
  }

  if (authLoading || loading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}/settings`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configuración AFIP/ARCA</h1>
            <p className="text-muted-foreground">Gestiona certificados para facturación electrónica</p>
          </div>
        </div>

        {/* Estado del Certificado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Estado del Certificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certificate && certificate.isActive ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Certificado Activo</p>
                    <p className="text-sm text-green-700 mt-1">
                      Las facturas se autorizarán automáticamente con AFIP
                    </p>
                    {certificate.validUntil && (
                      <p className="text-xs text-green-600 mt-2">
                        Válido hasta: {new Date(certificate.validUntil).toLocaleDateString()}
                        {certificate.isExpiringSoon && " ⚠️ Próximo a vencer"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleTestConnection} disabled={testing} variant="outline">
                    {testing ? 'Probando...' : 'Probar Conexión'}
                  </Button>
                  <Button onClick={handleDeleteCertificate} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Certificado
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Sin Certificado AFIP</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Las facturas se generarán con CAE simulado (no válidas legalmente)
                    </p>
                    <p className="text-xs text-amber-600 mt-2">
                      Configura tu certificado para emitir facturas oficiales
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuración */}
        {(!certificate || !certificate.isActive) && (
          <Card>
            <CardHeader>
              <CardTitle>Configurar Certificado</CardTitle>
              <CardDescription>
                Elige cómo quieres configurar tu certificado AFIP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="assisted">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="assisted">Asistida (Recomendado)</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>

                {/* Generación Asistida */}
                <TabsContent value="assisted" className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Pasos:</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Genera el CSR aquí</li>
                      <li>Descarga el archivo CSR</li>
                      <li>Ve a AFIP → Administrador de Relaciones</li>
                      <li>Sube el CSR y obtén el certificado (.crt)</li>
                      <li>Pega el contenido del certificado aquí</li>
                    </ol>
                  </div>

                  {!generatedCSR ? (
                    <Button onClick={handleGenerateCSR} disabled={generating} className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      {generating ? 'Generando...' : 'Generar CSR'}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>CSR Generado</Label>
                        <Textarea value={generatedCSR} readOnly rows={8} className="font-mono text-xs" />
                        <Button onClick={handleDownloadCSR} variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar CSR
                        </Button>
                      </div>

                      <div className="border-t pt-4 space-y-4">
                        <div className="space-y-2">
                          <Label>Certificado de AFIP (.crt)</Label>
                          <Textarea
                            placeholder="Pega aquí el contenido del certificado..."
                            value={assistedCert}
                            onChange={(e) => setAssistedCert(e.target.value)}
                            rows={8}
                            className="font-mono text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Contraseña (opcional)</Label>
                          <Input
                            type="password"
                            placeholder="Si el certificado tiene contraseña"
                            value={assistedPassword}
                            onChange={(e) => setAssistedPassword(e.target.value)}
                          />
                        </div>

                        <Button onClick={handleUploadAssisted} disabled={uploading} className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? 'Subiendo...' : 'Configurar Certificado'}
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Subida Manual */}
                <TabsContent value="manual" className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900">
                      Si ya tienes el certificado (.crt) y la clave privada (.key), pégalos aquí
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Certificado (.crt)</Label>
                    <Textarea
                      placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                      value={manualCert}
                      onChange={(e) => setManualCert(e.target.value)}
                      rows={8}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Clave Privada (.key)</Label>
                    <Textarea
                      placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      rows={8}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contraseña (opcional)</Label>
                    <Input
                      type="password"
                      placeholder="Si la clave privada tiene contraseña"
                      value={manualPassword}
                      onChange={(e) => setManualPassword(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleUploadManual} disabled={uploading} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Subiendo...' : 'Configurar Certificado'}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Información */}
        <Card>
          <CardHeader>
            <CardTitle>¿Por qué necesito esto?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Sin certificado:</strong> Puedes usar PayTo normalmente, pero las facturas tendrán un CAE simulado (no válidas legalmente).
            </p>
            <p>
              <strong>Con certificado:</strong> Las facturas se autorizarán automáticamente con AFIP y serán legalmente válidas.
            </p>
            <p className="text-xs">
              El certificado es personal de tu empresa y se obtiene desde AFIP con tu CUIT y clave fiscal.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
