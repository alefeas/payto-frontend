"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, FileText, Key, Shield, Info, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { afipVerificationService, type VerificationStatus } from "@/services/afip-verification.service"
import { afipCertificateService, AfipCertificate } from "@/services/afip-certificate.service"
import { companyService } from "@/services/company.service"

export default function VerifyCompanyPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [companyName, setCompanyName] = useState("")
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [certificate, setCertificate] = useState<AfipCertificate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  
  // Método asistido
  const [generatedCSR, setGeneratedCSR] = useState("")
  const [generating, setGenerating] = useState(false)
  const [assistedCert, setAssistedCert] = useState("")
  const [assistedPassword, setAssistedPassword] = useState("")
  const [assistedEnvironment, setAssistedEnvironment] = useState<'testing' | 'production'>('testing')
  
  // Método manual
  const [manualCert, setManualCert] = useState("")
  const [manualKey, setManualKey] = useState("")
  const [manualPassword, setManualPassword] = useState("")
  const [manualEnvironment, setManualEnvironment] = useState<'testing' | 'production'>('testing')
  const [uploading, setUploading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated && id) {
      loadData()
    }
  }, [isAuthenticated, authLoading, id, router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const company = await companyService.getCompany(id as string)
      setCompanyName(company.name)
      setUserRole(company.role || '')
      
      // Cargar certificado si existe
      try {
        const cert = await afipCertificateService.getCertificate(id as string)
        setCertificate(cert)
        setVerificationStatus({
          verification_status: cert.isActive ? 'verified' : 'unverified',
          verified_at: cert.validFrom,
          has_certificate: true
        })
      } catch (error: any) {
        if (error.response?.status === 404) {
          setVerificationStatus({
            verification_status: 'unverified',
            verified_at: null,
            has_certificate: false
          })
        } else {
          console.error('Error loading certificate:', error)
        }
      }
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateCSR = async () => {
    try {
      setGenerating(true)
      const result = await afipCertificateService.generateCSR(id as string)
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
        id as string,
        assistedCert,
        assistedPassword || undefined,
        assistedEnvironment
      )
      setCertificate(cert)
      setAssistedCert("")
      setAssistedPassword("")
      toast.success('Certificado configurado exitosamente')
      await loadData()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al subir certificado'
      toast.error(errorMsg)
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
        id as string,
        manualCert,
        manualKey,
        manualPassword || undefined,
        manualEnvironment
      )
      setCertificate(cert)
      setManualCert("")
      setManualKey("")
      setManualPassword("")
      toast.success('Certificado configurado exitosamente')
      await loadData()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al subir certificado'
      toast.error(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setTesting(true)
      const result = await afipCertificateService.testConnection(id as string)
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
    try {
      setDeleting(true)
      await afipCertificateService.deleteCertificate(id as string)
      setCertificate(null)
      setVerificationStatus({
        verification_status: 'unverified',
        verified_at: null,
        has_certificate: false
      })
      setShowDeleteDialog(false)
      toast.success('Certificado eliminado')
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al eliminar certificado'
      toast.error(errorMsg)
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || isLoading) return null
  if (!isAuthenticated) return null

  const isVerified = verificationStatus?.verification_status === 'verified' || (certificate && certificate.isActive)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Verificar Perfil Fiscal</h1>
            <p className="text-muted-foreground">{companyName}</p>
          </div>
          {isVerified && (
            <Badge className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          )}
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
            {isVerified ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Certificado Activo</p>
                    <p className="text-sm text-green-700 mt-1">
                      Facturación electrónica habilitada y consultas AFIP disponibles
                    </p>
                    {certificate?.validUntil && (
                      <p className="text-xs text-green-600 mt-2">
                        Válido hasta: {new Date(certificate.validUntil).toLocaleDateString()}
                        {certificate.isExpiringSoon && " ⚠️ Próximo a vencer"}
                      </p>
                    )}
                    {certificate && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium">
                          Ambiente: {certificate.environment === 'production' 
                            ? '✅ Producción (Facturas reales)' 
                            : '🧪 Homologación (Testing)'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleTestConnection} disabled={testing} variant="outline">
                    {testing ? 'Probando...' : 'Probar Conexión'}
                  </Button>
                  {userRole === 'owner' && (
                    <Button onClick={() => setShowDeleteDialog(true)} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Certificado
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Sin Certificado AFIP</p>
                  <p className="text-sm text-amber-700 mt-1">
                    No podrás usar facturación electrónica ni consultar datos automáticos de clientes/proveedores
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!isVerified && (
          <Card>
            <CardHeader>
              <CardTitle>Configurar Certificado AFIP</CardTitle>
              <CardDescription>
                Elige el método que prefieras para configurar tu certificado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="assisted">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="assisted">Asistida (Recomendado)</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>

                <TabsContent value="assisted" className="space-y-4 mt-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Pasos del proceso asistido:</AlertTitle>
                    <AlertDescription>
                      <ol className="text-sm space-y-1 list-decimal list-inside mt-2">
                        <li>Genera el CSR aquí</li>
                        <li>Descarga el archivo CSR</li>
                        <li>Ve a AFIP → Administrador de Relaciones → Certificados</li>
                        <li>Sube el CSR y obtén el certificado (.crt)</li>
                        <li>Pega el contenido del certificado aquí</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  {!generatedCSR ? (
                    <Button onClick={handleGenerateCSR} disabled={generating} className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      {generating ? 'Generando...' : 'Generar CSR'}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>CSR Generado</Label>
                        <Textarea value={generatedCSR} readOnly rows={6} className="font-mono text-xs" />
                        <Button onClick={handleDownloadCSR} variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar CSR
                        </Button>
                      </div>

                      <div className="border-t pt-4 space-y-4">
                        <div className="space-y-2">
                          <Label>Certificado de AFIP (.crt) *</Label>
                          <Textarea
                            placeholder="Pega aquí el contenido del certificado..."
                            value={assistedCert}
                            onChange={(e) => setAssistedCert(e.target.value)}
                            rows={6}
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

                        <div className="space-y-2">
                          <Label>Ambiente AFIP *</Label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={assistedEnvironment}
                            onChange={(e) => setAssistedEnvironment(e.target.value as 'testing' | 'production')}
                          >
                            <option value="testing">🧪 Homologación (Testing) - Para pruebas</option>
                            <option value="production">✅ Producción - Facturas reales</option>
                          </select>
                          <p className="text-xs text-muted-foreground">
                            {assistedEnvironment === 'testing' 
                              ? '⚠️ Las facturas NO serán válidas legalmente' 
                              : '✅ Las facturas serán válidas legalmente'}
                          </p>
                        </div>

                        <Button onClick={handleUploadAssisted} disabled={uploading} className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? 'Subiendo...' : 'Configurar Certificado'}
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="manual" className="space-y-4 mt-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Método manual</AlertTitle>
                    <AlertDescription>
                      Si ya tienes el certificado (.crt) y la clave privada (.key), pégalos aquí directamente
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>Certificado (.crt) *</Label>
                    <Textarea
                      placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                      value={manualCert}
                      onChange={(e) => setManualCert(e.target.value)}
                      rows={6}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Clave Privada (.key) *</Label>
                    <Textarea
                      placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      rows={6}
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

                  <div className="space-y-2">
                    <Label>Ambiente AFIP *</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={manualEnvironment}
                      onChange={(e) => setManualEnvironment(e.target.value as 'testing' | 'production')}
                    >
                      <option value="testing">🧪 Homologación (Testing) - Para pruebas</option>
                      <option value="production">✅ Producción - Facturas reales</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      {manualEnvironment === 'testing' 
                        ? '⚠️ Las facturas NO serán válidas legalmente' 
                        : '✅ Las facturas serán válidas legalmente'}
                    </p>
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
              <strong>Sin certificado:</strong> No podrás emitir facturas electrónicas válidas ni consultar datos de AFIP automáticamente.
            </p>
            <p>
              <strong>Con certificado de producción:</strong> Las facturas se autorizarán automáticamente con AFIP y serán legalmente válidas. Podrás consultar datos de clientes y proveedores.
            </p>
            <p>
              <strong>Con certificado de homologación:</strong> Puedes probar el sistema con tu CUIT real pero en servidores de prueba de AFIP. Las facturas NO aparecerán en tu perfil fiscal real.
            </p>
          </CardContent>
        </Card>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Nunca compartas tu clave privada (.key) con nadie. PayTo la almacena de forma segura y encriptada solo para comunicarse con AFIP en tu nombre.
          </AlertDescription>
        </Alert>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar certificado AFIP?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán el certificado y la clave privada. No podrás emitir facturas electrónicas ni consultar datos de AFIP hasta que configures un nuevo certificado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCertificate} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
