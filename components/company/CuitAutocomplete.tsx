"use client"

import { useState } from "react"
import { Search, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { afipPadronService, TaxpayerData } from "@/services/afip-padron.service"
import { formatCUIT } from "@/lib/input-formatters"

interface CuitAutocompleteProps {
  companyId: string
  cuit: string
  onCuitChange: (cuit: string) => void
  onDataFetched: (data: TaxpayerData) => void
  disabled?: boolean
}

export function CuitAutocomplete({ 
  companyId, 
  cuit, 
  onCuitChange, 
  onDataFetched,
  disabled 
}: CuitAutocompleteProps) {
  const [loading, setLoading] = useState(false)
  const [mockMode, setMockMode] = useState(false)

  const handleSearch = async () => {
    if (!cuit || cuit.replace(/\D/g, '').length !== 11) {
      toast.error('Ingresa un CUIT/CUIL válido de 11 dígitos')
      return
    }

    try {
      setLoading(true)
      const response = await afipPadronService.searchByCuit(companyId, cuit)
      
      if (response.success && response.data) {
        onDataFetched(response.data)
        setMockMode(response.mock_mode)
        
        const message = response.mock_mode
          ? 'Datos simulados cargados. En producción se obtendrán datos reales de AFIP.'
          : 'Datos obtenidos de AFIP correctamente'
        
        toast.success(message, {
          description: response.mock_mode
            ? 'El servicio de padrón AFIP solo funciona con certificado de producción'
            : `${response.data.business_name || response.data.name || 'Contribuyente'} encontrado`
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
    <div className="space-y-2">
      <Label>CUIT/CUIL *</Label>
      <div className="flex gap-2">
        <Input
          placeholder="20-12345678-9"
          value={cuit}
          onChange={(e) => onCuitChange(formatCUIT(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch()
            }
          }}
          disabled={disabled || loading}
          maxLength={13}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={disabled || loading || !cuit || cuit.replace(/\D/g, '').length !== 11}
          title="Buscar datos en AFIP"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      {mockMode && (
        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded p-2">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <p>Modo simulación: El servicio de padrón AFIP solo funciona con certificado de producción</p>
        </div>
      )}
    </div>
  )
}
