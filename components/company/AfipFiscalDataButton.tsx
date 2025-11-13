"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { afipPadronService } from "@/services/afip-padron.service"
import { useAfipGuard } from "@/components/afip/afip-guard"

interface AfipFiscalDataButtonProps {
  companyId: string
  onDataFetched?: (taxCondition: string) => void
}

export function AfipFiscalDataButton({ companyId, onDataFetched }: AfipFiscalDataButtonProps) {
  const [loading, setLoading] = useState(false)
  const { validateAndExecute } = useAfipGuard(companyId)

  const handleFetchFiscalData = () => {
    validateAndExecute(async () => {
      try {
        setLoading(true)
        const response = await afipPadronService.syncTaxCondition(companyId)
        
        if (response.success) {
          if (onDataFetched) {
            onDataFetched(response.tax_condition)
          }
          
          const conditionLabel = {
            'registered_taxpayer': 'Responsable Inscripto',
            'monotax': 'Monotributo',
            'exempt': 'Exento',
            'final_consumer': 'Consumidor Final'
          }[response.tax_condition] || response.tax_condition
          
          toast.success(response.message, {
            description: response.mock_mode 
              ? 'Datos simulados - El servicio de padrón AFIP solo funciona con certificado de producción'
              : `Condición actualizada: ${conditionLabel}`
          })
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || error.message || 'Error al sincronizar con AFIP'
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    }, 'Certificado AFIP requerido para sincronizar datos fiscales')
  }

  return (
    <Button 
      type="button"
      variant="outline" 
      onClick={handleFetchFiscalData}
      disabled={loading}
      className="flex-shrink-0"
      title="Sincronizar condición fiscal desde AFIP"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  )
}
