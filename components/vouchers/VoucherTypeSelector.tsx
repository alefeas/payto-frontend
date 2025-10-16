"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, FileX, FilePlus } from "lucide-react"

interface VoucherType {
  code: string
  name: string
  category: string
  requiresAssociation: boolean
}

interface VoucherTypeSelectorProps {
  availableTypes: VoucherType[]
  selectedType: string
  onSelect: (type: string) => void
  disabled?: boolean
}

export function VoucherTypeSelector({ 
  availableTypes, 
  selectedType, 
  onSelect,
  disabled = false 
}: VoucherTypeSelectorProps) {
  const getIcon = (category: string) => {
    switch (category) {
      case 'credit_note':
        return <FileX className="h-4 w-4" />
      case 'debit_note':
        return <FilePlus className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'credit_note':
        return 'Nota de Crédito'
      case 'debit_note':
        return 'Nota de Débito'
      default:
        return 'Comprobante'
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="voucher-type">Tipo de Comprobante *</Label>
      <Select value={selectedType} onValueChange={onSelect} disabled={disabled}>
        <SelectTrigger id="voucher-type">
          <SelectValue placeholder="Seleccione tipo de comprobante" />
        </SelectTrigger>
        <SelectContent>
          {availableTypes.map((type) => (
            <SelectItem key={type.code} value={type.code}>
              <div className="flex items-center gap-2">
                {getIcon(type.category)}
                <div className="flex flex-col">
                  <span className="font-medium">{type.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {getCategoryLabel(type.category)}
                    {type.requiresAssociation && ' • Requiere asociación'}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
