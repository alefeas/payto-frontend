"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"

interface Perception {
  type: string
  name: string
  rate: number
  base_type: 'net' | 'total' | 'vat'
  jurisdiction?: string
}

interface Props {
  companyId: string
  isPerceptionAgent: boolean
  autoPerceptions: Perception[]
  onUpdate: () => void
}

export function PerceptionAgentConfig({ companyId, isPerceptionAgent, autoPerceptions, onUpdate }: Props) {
  const [enabled, setEnabled] = useState(isPerceptionAgent)
  const [perceptions, setPerceptions] = useState<Perception[]>(autoPerceptions || [])
  const [saving, setSaving] = useState(false)

  const addPerception = () => {
    setPerceptions([...perceptions, {
      type: 'iibb_bsas',
      name: '',
      rate: 3,
      base_type: 'net'
    }])
  }

  const removePerception = (index: number) => {
    setPerceptions(perceptions.filter((_, i) => i !== index))
  }

  const updatePerception = (index: number, field: keyof Perception, value: any) => {
    const newPerceptions = [...perceptions]
    newPerceptions[index] = { ...newPerceptions[index], [field]: value }
    setPerceptions(newPerceptions)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await apiClient.put(`/companies/${companyId}/perception-config`, {
        is_perception_agent: enabled,
        auto_perceptions: enabled ? perceptions : []
      })
      toast.success('Configuración guardada')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agente de Percepciones</CardTitle>
        <CardDescription>
          Configura percepciones que se aplicarán automáticamente al emitir facturas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Activar agente de percepciones</Label>
            <p className="text-sm text-muted-foreground">
              Las percepciones configuradas se agregarán automáticamente
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            <div className="space-y-3">
              {perceptions.map((perception, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePerception(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select
                        value={perception.type}
                        onValueChange={(value) => updatePerception(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="iva">Percepción IVA</SelectItem>
                          <SelectItem value="ganancias">Percepción Ganancias</SelectItem>
                          <SelectItem value="impuestos_internos">Impuestos Internos</SelectItem>
                          <SelectItem value="iibb_bsas">IIBB Buenos Aires</SelectItem>
                          <SelectItem value="iibb_caba">IIBB CABA</SelectItem>
                          <SelectItem value="iibb_catamarca">IIBB Catamarca</SelectItem>
                          <SelectItem value="iibb_chaco">IIBB Chaco</SelectItem>
                          <SelectItem value="iibb_chubut">IIBB Chubut</SelectItem>
                          <SelectItem value="iibb_cordoba">IIBB Córdoba</SelectItem>
                          <SelectItem value="iibb_corrientes">IIBB Corrientes</SelectItem>
                          <SelectItem value="iibb_entrerios">IIBB Entre Ríos</SelectItem>
                          <SelectItem value="iibb_formosa">IIBB Formosa</SelectItem>
                          <SelectItem value="iibb_jujuy">IIBB Jujuy</SelectItem>
                          <SelectItem value="iibb_lapampa">IIBB La Pampa</SelectItem>
                          <SelectItem value="iibb_larioja">IIBB La Rioja</SelectItem>
                          <SelectItem value="iibb_mendoza">IIBB Mendoza</SelectItem>
                          <SelectItem value="iibb_misiones">IIBB Misiones</SelectItem>
                          <SelectItem value="iibb_neuquen">IIBB Neuquén</SelectItem>
                          <SelectItem value="iibb_rionegro">IIBB Río Negro</SelectItem>
                          <SelectItem value="iibb_salta">IIBB Salta</SelectItem>
                          <SelectItem value="iibb_sanjuan">IIBB San Juan</SelectItem>
                          <SelectItem value="iibb_sanluis">IIBB San Luis</SelectItem>
                          <SelectItem value="iibb_santacruz">IIBB Santa Cruz</SelectItem>
                          <SelectItem value="iibb_santafe">IIBB Santa Fe</SelectItem>
                          <SelectItem value="iibb_sgo_estero">IIBB Santiago del Estero</SelectItem>
                          <SelectItem value="iibb_tdf">IIBB Tierra del Fuego</SelectItem>
                          <SelectItem value="iibb_tucuman">IIBB Tucumán</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción *</Label>
                      <Input
                        placeholder="Ej: Percepción IIBB Buenos Aires"
                        value={perception.name}
                        onChange={(e) => updatePerception(index, 'name', e.target.value)}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Alícuota (%) *</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Ej: 3.5"
                        value={perception.rate}
                        onChange={(e) => updatePerception(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Base de Cálculo *</Label>
                      <Select
                        value={perception.base_type}
                        onValueChange={(value: 'net' | 'total' | 'vat') => updatePerception(index, 'base_type', value)}
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
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" onClick={addPerception} variant="outline" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Percepción
            </Button>
          </>
        )}

        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </CardContent>
    </Card>
  )
}
