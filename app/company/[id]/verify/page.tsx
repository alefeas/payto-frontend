"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Upload, CheckCircle2, AlertCircle, Key, Shield, Info, Download, Trash2, ClipboardCheck, AlertTriangle, Loader2 } from "lucide-react"
import { InfoMessage } from "@/components/ui/info-message"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { type VerificationStatus } from "@/services/afip-verification.service"
import { afipCertificateService, AfipCertificate } from "@/services/afip-certificate.service"
import { companyService } from "@/services/company.service"
import { parseDateLocal } from "@/lib/utils"
import { colors } from "@/styles"
import { ResponsiveHeading, ResponsiveText } from "@/components/ui/responsive-heading"

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
      router.push('/log-in')
    } else if (isAuthenticated && id) {
      loadData()
    }
  }, [isAuthenticated, authLoading, id, router])

  // Verificar que el usuario sea owner o admin
  useEffect(() => {
    if (userRole && userRole !== 'owner' && userRole !== 'administrator') {
      toast.error('No tienes permisos para acceder a esta página')
      router.push(`/company/${id}`)
    }
  }, [userRole, id, router])

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
          verification_status: cert?.isActive ? 'verified' : 'unverified',
          verified_at: cert?.validFrom || null,
          has_certificate: true
        })
      } catch (error: any) {
        console.error('Error loading certificate:', error)
        setCertificate(null)
        setVerificationStatus({
          verification_status: 'unverified',
          verified_at: null,
          has_certificate: false
        })
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
    } catch (error: any) {
      console.error('Error generating CSR:', error)
      toast.error(error.message || 'Error al generar CSR')
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
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al subir certificado'
      toast.error('Error al configurar certificado', {
        description: errorMsg
      })
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
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al subir certificado'
      toast.error('Error al configurar certificado', {
        description: errorMsg
      })
    } finally {
      setUploading(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setTesting(true)
      const result = await afipCertificateService.testConnection(id as string)
      if (result.success) {
        toast.success('Conexión exitosa con AFIP', {
          description: result.message + (result.expires_in_days ? ` - Expira en ${result.expires_in_days} días` : '')
        })
      } else {
        toast.error('Error en la conexión', {
          description: result.message
        })
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al probar conexión con AFIP'
      toast.error('Error al probar conexión', {
        description: errorMsg
      })
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto" style={{ color: colors.accent }} />
          <div className="space-y-1">
            <p className="text-base font-medium text-gray-900">Verificando certificado AFIP</p>
            <p className="text-sm text-muted-foreground">Esto solo tomará un momento...</p>
          </div>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  const isVerified = verificationStatus?.verification_status === 'verified' || (certificate && certificate.isActive)

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <BackButton href={`/company/${id}`} className="mt-1" />
          <div className="flex-1 min-w-0">
            <ResponsiveHeading level="h1" className="line-clamp-2">
              Verificar Perfil Fiscal
            </ResponsiveHeading>
            <ResponsiveText className="text-muted-foreground line-clamp-1 mt-1">
              {companyName}
            </ResponsiveText>
          </div>
          {isVerified && (
            <Badge style={{ backgroundColor: colors.accent, color: '#fff' }} className="whitespace-nowrap flex-shrink-0 mt-1">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          )}
        </div>

        {/* Estado del Certificado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: colors.accent }} />
              Estado del Certificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isVerified ? (
              <div className="space-y-4">
                <InfoMessage
                  icon={CheckCircle2}
                  iconColor={colors.accent}
                  title="Certificado Activo"
                  variant="info"
                >
                  <div className="space-y-2 text-xs sm:text-sm text-gray-900 mt-1">
                    <p>Facturación electrónica habilitada y consultas AFIP disponibles</p>
                    {certificate?.validUntil && (
                      <p className="flex flex-wrap items-center gap-1.5">
                        <span>Válido hasta: {parseDateLocal(certificate.validUntil)?.toLocaleDateString('es-AR')}</span>
                        {certificate.isExpiringSoon && (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" /> 
                            <span>Próximo a vencer</span>
                          </span>
                        )}
                      </p>
                    )}
                    {certificate && (
                      <p className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
                        <span>Ambiente:</span>
                        {certificate.environment === 'production' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" /> 
                            <span>Producción (Facturas reales)</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" style={{ color: colors.accent }} /> 
                            <span>Homologación (Testing)</span>
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </InfoMessage>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleTestConnection} 
                    disabled={testing} 
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {testing ? 'Probando...' : 'Probar Conexión'}
                  </Button>
                  {userRole === 'owner' && (
                    <Button 
                      onClick={() => setShowDeleteDialog(true)} 
                      variant="destructive"
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Certificado
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <InfoMessage
                icon={AlertCircle}
                iconColor={colors.accent}
                title="Sin Certificado AFIP"
                description="No podrás usar facturación electrónica ni consultar datos automáticos de clientes/proveedores"
                variant="info"
              />
            )}
          </CardContent>
        </Card>

        {!isVerified && (userRole === 'owner' || userRole === 'administrator') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Configurar Certificado AFIP</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Elige el método que prefieras para configurar tu certificado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="assisted">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="assisted" className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">Asistida (Recomendado)</span>
                    <span className="sm:hidden">Asistida</span>
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="text-xs sm:text-sm">Manual</TabsTrigger>
                </TabsList>

                <TabsContent value="assisted" className="space-y-4 mt-4">
                  <InfoMessage
                    icon={Info}
                    iconColor={colors.accent}
                    title="Pasos del proceso asistido:"
                    variant="info"
                  >
                    <ol className="text-sm space-y-1 list-decimal list-inside mt-2 text-gray-900">
                      <li>Genera el CSR aquí</li>
                      <li>Descarga el archivo CSR</li>
                      <li>Ve a AFIP → Administrador de Relaciones → Certificados</li>
                      <li>Sube el CSR y obtén el certificado (.crt)</li>
                      <li>Pega el contenido del certificado aquí</li>
                    </ol>
                  </InfoMessage>

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
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept=".crt,.pem,.cer"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const text = await file.text()
                                  setAssistedCert(text)
                                  toast.success('Archivo cargado')
                                }
                              }}
                            />
                            <p className="text-xs text-muted-foreground">O pega el contenido manualmente:</p>
                            <Textarea
                              placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                              value={assistedCert}
                              onChange={(e) => setAssistedCert(e.target.value)}
                              rows={6}
                              className="font-mono text-xs"
                            />
                          </div>
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
                          <Select value={assistedEnvironment} onValueChange={(value) => setAssistedEnvironment(value as 'testing' | 'production')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="testing">Homologación (Testing) - Para pruebas</SelectItem>
                              <SelectItem value="production">Producción - Facturas reales</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-600 flex items-center gap-1.5">
                            {assistedEnvironment === 'testing' 
                              ? <><AlertTriangle className="h-3 w-3 inline text-amber-500" /> Las facturas NO serán válidas legalmente</> 
                              : <><CheckCircle2 className="h-3 w-3 inline text-green-600" /> Las facturas serán válidas legalmente</>}
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
                  <InfoMessage
                    icon={Info}
                    iconColor={colors.accent}
                    title="Método manual"
                    description="Si ya tienes el certificado (.crt) y la clave privada (.key), pégalos aquí directamente"
                    variant="info"
                  />

                  <div className="space-y-2">
                    <Label>Certificado (.crt) *</Label>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept=".crt,.pem,.cer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const text = await file.text()
                            setManualCert(text)
                            toast.success('Certificado cargado')
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">O pega el contenido:</p>
                      <Textarea
                        placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                        value={manualCert}
                        onChange={(e) => setManualCert(e.target.value)}
                        rows={6}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Clave Privada (.key) *</Label>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept=".key,.pem"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const text = await file.text()
                            setManualKey(text)
                            toast.success('Clave privada cargada')
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">O pega el contenido:</p>
                      <Textarea
                        placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                        value={manualKey}
                        onChange={(e) => setManualKey(e.target.value)}
                        rows={6}
                        className="font-mono text-xs"
                      />
                    </div>
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
                    <Select value={manualEnvironment} onValueChange={(value) => setManualEnvironment(value as 'testing' | 'production')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="testing">Homologación (Testing) - Para pruebas</SelectItem>
                        <SelectItem value="production">Producción - Facturas reales</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600 flex items-center gap-1.5">
                      {manualEnvironment === 'testing' 
                        ? <><AlertTriangle className="h-3 w-3 inline text-amber-500" /> Las facturas NO serán válidas legalmente</> 
                        : <><CheckCircle2 className="h-3 w-3 inline text-green-600" /> Las facturas serán válidas legalmente</>}
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

        {/* Autorizaciones AFIP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: colors.accent }} />
              Autorizaciones Requeridas en AFIP
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Tu certificado debe tener estas autorizaciones para que PayTo funcione correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">WSFE - Facturación Electrónica</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Servicio principal para emitir facturas, notas de crédito y débito electrónicas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">WS SR PADRON A5 - Padrón de Contribuyentes</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Permite consultar automáticamente la condición IVA, domicilio fiscal y actividades de clientes/proveedores
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="font-semibold text-sm flex items-center gap-2 text-gray-900">
                <ClipboardCheck className="h-4 w-4" style={{ color: colors.accent }} />
                Cómo autorizar los servicios:
              </p>
              <ol className="text-xs space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Ingresá a <strong>AFIP con Clave Fiscal</strong></li>
                <li>Buscá <strong>"Administrador de Relaciones de Clave Fiscal"</strong></li>
                <li>Seleccioná <strong>"Nueva Relación"</strong></li>
                <li>Buscá el servicio <strong>"WSFE"</strong> y autorizá tu certificado</li>
                <li>Repetí el proceso para <strong>"WS SR PADRON A5"</strong> o <strong>"Padrón Alcance 5"</strong></li>
                <li>Confirmá las autorizaciones</li>
              </ol>
            </div>

            <InfoMessage
              icon={AlertCircle}
              iconColor={colors.accent}
              title="Importante"
              description="Sin estas autorizaciones, el certificado no funcionará correctamente. El servicio de Padrón (WS SR PADRON A5) solo funciona en ambiente de producción, no en homologación."
              variant="info"
            />
          </CardContent>
        </Card>

        {/* Información */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">¿Por qué necesito esto?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-muted-foreground">
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

        <InfoMessage
          icon={AlertCircle}
          iconColor={colors.accent}
          title="Importante"
          description="Nunca compartas tu clave privada (.key) con nadie. PayTo la almacena de forma segura y encriptada solo para comunicarse con AFIP en tu nombre."
          variant="info"
        />
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
