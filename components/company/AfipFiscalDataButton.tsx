"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { afipPadronService } from "@/services/afip-padron.service"

interface AfipFiscalDataButtonProps {
  companyId: string
  onDataFetched?: (taxCondition: string) => void
}

export function AfipFiscalDataButton({ companyId, onDataFetched }: AfipFiscalDataButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleFetchFiscalData = async () => {
    try {
      setLoading(true)
      const response = await afipPadronService.getOwnFiscalData(companyId)
      
      if (response.success && response.data) {
        const taxConditionMap: Record<string, string> = {
          'responsable_inscripto': 'registered_taxpayer',
          'monotributo': 'monotax',
          'exento': 'exempt',
          'consumidor_final': 'final_consumer'
        }
        
        const mappedCondition = taxConditionMap[response.data.tax_condition] || response.data.tax_condition
        
        if (onDataFetched) {
          onDataFetched(mappedCondition)
        }
        
        const message = response.mock_mode 
          ? `Condición fiscal actualizada (modo simulación). En producción se obtendrán datos reales de AFIP.`
          : `Condición fiscal actualizada desde AFIP: ${response.data.tax_condition}`
        
        toast.success(message, {
          description: response.mock_mode 
            ? 'El servicio de padrón AFIP solo funciona con certificado de producción'
            : undefined
        })
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Error al consultar AFIP'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      type="button"
      variant="outline" 
      onClick={handleFetchFiscalData}
      disabled={loading}
      className="flex-shrink-0"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  )
}
