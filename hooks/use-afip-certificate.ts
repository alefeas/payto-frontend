import { useState, useEffect, useCallback } from 'react'
import { afipCertificateService, AfipCertificate } from '@/services/afip-certificate.service'

// Cache global para evitar múltiples cargas del mismo certificado
const certificateCache = new Map<string, { certificate: AfipCertificate | null, isVerified: boolean, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useAfipCertificate(companyId: string) {
  const [certificate, setCertificate] = useState<AfipCertificate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  const loadCertificate = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false)
      return
    }

    // Verificar cache primero
    const cached = certificateCache.get(companyId)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setCertificate(cached.certificate)
      setIsVerified(cached.isVerified)
      setIsLoading(false)
      return
    }
    
    try {
      setIsLoading(true)
      const cert = await afipCertificateService.getCertificate(companyId)
      const verified = cert?.isActive || false
      
      setCertificate(cert)
      setIsVerified(verified)
      
      // Guardar en cache
      certificateCache.set(companyId, {
        certificate: cert,
        isVerified: verified,
        timestamp: now
      })
    } catch (error) {
      console.error('Error loading AFIP certificate:', error)
      setCertificate(null)
      setIsVerified(false)
      
      // Guardar error en cache por menos tiempo
      certificateCache.set(companyId, {
        certificate: null,
        isVerified: false,
        timestamp: now - CACHE_DURATION + 30000 // Cache por solo 30 segundos en caso de error
      })
    } finally {
      setIsLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    loadCertificate()
  }, [loadCertificate])

  const refreshCertificate = useCallback(async () => {
    if (!companyId) return
    
    // Limpiar cache para forzar recarga
    certificateCache.delete(companyId)
    
    try {
      const cert = await afipCertificateService.getCertificate(companyId)
      const verified = cert?.isActive || false
      
      setCertificate(cert)
      setIsVerified(verified)
      
      // Actualizar cache
      certificateCache.set(companyId, {
        certificate: cert,
        isVerified: verified,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Error refreshing AFIP certificate:', error)
      setCertificate(null)
      setIsVerified(false)
    }
  }, [companyId])

  return {
    certificate,
    isVerified,
    isLoading,
    refresh: refreshCertificate
  }
}