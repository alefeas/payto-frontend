"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface Perception {
  type: string
  name: string
  rate: number
  jurisdiction?: string
  baseType?: string
  base_type?: string
}

interface InvoicePerceptionsSectionProps {
  perceptions: Perception[]
  currency: string
  subtotal: number
  totalTaxes: number
  onAddPerception: () => void
  onRemovePerception: (index: number) => void
  onUpdatePerception: (index: number, field: string, value: any) => void
  getCurrencySymbol: (currency: string) => string
  disabled?: boolean
  disabledMessage?: string
}

export function InvoicePerceptionsSection({
  perceptions,
  currency,
  subtotal,
  totalTaxes,
  onAddPerception,
  onRemovePerception,
  onUpdatePerception,
  getCurrencySymbol,
  disabled = false,
  disabledMessage
}: InvoicePerceptionsSectionProps) {
  
  const calculatePerceptionAmount = (perception: Perception) => {
    const baseType = perception.baseType ?? perception.base_type ?? 'net'
    let base = subtotal
    if (baseType === 'total') {
      base = subtotal + totalTaxes
    } else if (baseType === 'vat') {
      base = totalTaxes
    }
    return base * (perception.rate || 0) / 100
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Percepciones</CardTitle>
            <CardDescription>Percepciones aplicables según jurisdicción</CardDescription>
          </div>
          <Button 
            type="button" 
            onClick={onAddPerception} 
            size="sm" 
            variant="outline"
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Percepción
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {disabled && disabledMessage ? (
          <div className="text-center py-6 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 font-medium">{disabledMessage}</p>
          </div>
        ) : perceptions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No hay percepciones aplicadas</p>
            <p className="text-xs">Las percepciones se agregan según la jurisdicción</p>
          </div>
        ) : (
          perceptions.map((perception, index) => {
            const perceptionAmount = calculatePerceptionAmount(perception)
            const baseType = perception.baseType ?? perception.base_type ?? 'net'
            let base = subtotal
            if (baseType === 'total') {
              base = subtotal + totalTaxes
            } else if (baseType === 'vat') {
              base = totalTaxes
            }
            
            return (
              <div key={index} className="space-y-3 p-4 rounded-lg border border-gray-200 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemovePerception(index)}
                  className="absolute top-2 right-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Eliminar percepción"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                    <div className="space-y-2">
                      <Label>Tipo de Percepción *</Label>
                      <Select 
                        value={perception.type} 
                        onValueChange={(value) => onUpdatePerception(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="vat_perception">Percepción IVA</SelectItem>
                          <SelectItem value="income_tax_perception">Percepción Ganancias</SelectItem>
                          <SelectItem value="internal_taxes_perception">Impuestos Internos</SelectItem>
                          <SelectItem value="gross_income_buenosaires">IIBB Buenos Aires</SelectItem>
                          <SelectItem value="gross_income_caba">IIBB CABA</SelectItem>
                          <SelectItem value="gross_income_catamarca">IIBB Catamarca</SelectItem>
                          <SelectItem value="gross_income_chaco">IIBB Chaco</SelectItem>
                          <SelectItem value="gross_income_chubut">IIBB Chubut</SelectItem>
                          <SelectItem value="gross_income_cordoba">IIBB Córdoba</SelectItem>
                          <SelectItem value="gross_income_corrientes">IIBB Corrientes</SelectItem>
                          <SelectItem value="gross_income_entrerios">IIBB Entre Ríos</SelectItem>
                          <SelectItem value="gross_income_formosa">IIBB Formosa</SelectItem>
                          <SelectItem value="gross_income_jujuy">IIBB Jujuy</SelectItem>
                          <SelectItem value="gross_income_lapampa">IIBB La Pampa</SelectItem>
                          <SelectItem value="gross_income_larioja">IIBB La Rioja</SelectItem>
                          <SelectItem value="gross_income_mendoza">IIBB Mendoza</SelectItem>
                          <SelectItem value="gross_income_misiones">IIBB Misiones</SelectItem>
                          <SelectItem value="gross_income_neuquen">IIBB Neuquén</SelectItem>
                          <SelectItem value="gross_income_rionegro">IIBB Río Negro</SelectItem>
                          <SelectItem value="gross_income_salta">IIBB Salta</SelectItem>
                          <SelectItem value="gross_income_sanjuan">IIBB San Juan</SelectItem>
                          <SelectItem value="gross_income_sanluis">IIBB San Luis</SelectItem>
                          <SelectItem value="gross_income_santacruz">IIBB Santa Cruz</SelectItem>
                          <SelectItem value="gross_income_santafe">IIBB Santa Fe</SelectItem>
                          <SelectItem value="gross_income_santiagodelestero">IIBB Santiago del Estero</SelectItem>
                          <SelectItem value="gross_income_tierradelfuego">IIBB Tierra del Fuego</SelectItem>
                          <SelectItem value="gross_income_tucuman">IIBB Tucumán</SelectItem>
                          <SelectItem value="other_perception">Otra Percepción</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descripción *</Label>
                      <Input
                        placeholder="Ej: Percepción IIBB Buenos Aires"
                        value={perception.name ?? ''}
                        onChange={(e) => onUpdatePerception(index, 'name', e.target.value.slice(0, 100))}
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Alícuota (%) *</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Ej: 3.5"
                        value={perception.rate ?? ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          onUpdatePerception(index, 'rate', Math.min(val, 100))
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Base de Cálculo *</Label>
                      <Select 
                        value={baseType} 
                        onValueChange={(value) => {
                          const field = 'baseType' in perception ? 'baseType' : 'base_type'
                          onUpdatePerception(index, field, value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="net">Neto sin IVA</SelectItem>
                          <SelectItem value="total">Total con IVA</SelectItem>
                          <SelectItem value="vat">Solo IVA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Monto</Label>
                      <div className="h-10 flex items-center justify-end px-3 bg-muted rounded-md font-medium">
                        {getCurrencySymbol(currency)}{perceptionAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 text-sm border-t pt-2">
                  <span className="text-muted-foreground">Base: <span className="font-medium text-foreground">{getCurrencySymbol(currency)}{base.toFixed(2)}</span></span>
                  <span className="text-muted-foreground">Alícuota: <span className="font-medium text-foreground">{perception.rate || 0}%</span></span>
                  <span className="text-muted-foreground">Total: <span className="font-medium text-orange-600">{getCurrencySymbol(currency)}{perceptionAmount.toFixed(2)}</span></span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
