"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface InvoiceItem {
  description: string
  quantity: number
  unit_price?: number
  unitPrice?: number
  discount_percentage?: number
  discountPercentage?: number
  tax_rate?: number
  taxRate?: number
}

interface InvoiceItemsSectionProps {
  items: InvoiceItem[]
  currency: string
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onUpdateItem: (index: number, field: string, value: any) => void
  getCurrencySymbol: (currency: string) => string
  getTaxRateLabel?: (rate: number | undefined) => string
  defaultVat?: number
}

export function InvoiceItemsSection({
  items,
  currency,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  getCurrencySymbol,
  getTaxRateLabel,
  defaultVat = 21
}: InvoiceItemsSectionProps) {
  
  const calculateItemTotal = (item: InvoiceItem) => {
    const unitPrice = item.unit_price ?? item.unitPrice ?? 0
    const quantity = item.quantity ?? 1
    const discountPercentage = item.discount_percentage ?? item.discountPercentage ?? 0
    const taxRate = item.tax_rate ?? item.taxRate ?? defaultVat
    
    const base = quantity * unitPrice
    const discount = discountPercentage / 100
    const subtotal = base * (1 - discount)
    const actualTaxRate = (taxRate && taxRate > 0) ? taxRate : 0
    const tax = subtotal * actualTaxRate / 100
    return { subtotal, total: subtotal + tax }
  }

  const getItemValue = (item: InvoiceItem, field: string) => {
    if (field === 'unitPrice') return item.unit_price ?? item.unitPrice ?? 0
    if (field === 'discountPercentage') return item.discount_percentage ?? item.discountPercentage ?? 0
    if (field === 'taxRate') return item.tax_rate ?? item.taxRate ?? defaultVat
    return (item as any)[field]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ítems de la Factura</CardTitle>
            <CardDescription>Detalle de productos o servicios</CardDescription>
          </div>
          <Button type="button" onClick={onAddItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Ítem
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => {
          const itemTotals = calculateItemTotal(item)
          
          return (
            <div key={index} className="space-y-3 p-4 border rounded-lg relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveItem(index)}
                disabled={items.length === 1}
                className="absolute top-2 right-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-30"
                title="Eliminar ítem"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="grid grid-cols-1 gap-4 pr-10">
                <div className="space-y-2">
                  <Label>Descripción *</Label>
                  <Input
                    placeholder="Descripción del ítem"
                    value={item.description ?? ''}
                    onChange={(e) => onUpdateItem(index, 'description', e.target.value.slice(0, 200))}
                    maxLength={200}
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      min="0.01"
                      max="999999.99"
                      step="0.01"
                      value={item.quantity ?? 1}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        onUpdateItem(index, 'quantity', Math.min(Math.max(val, 0.01), 999999.99))
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Precio Unit. *</Label>
                    <Input
                      type="number"
                      min="0"
                      max="999999999.99"
                      step="0.01"
                      value={getItemValue(item, 'unitPrice')}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        const field = 'unit_price' in item ? 'unit_price' : 'unitPrice'
                        onUpdateItem(index, field, Math.min(Math.max(val, 0), 999999999.99))
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bonif. (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={getItemValue(item, 'discountPercentage')}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        const field = 'discount_percentage' in item ? 'discount_percentage' : 'discountPercentage'
                        onUpdateItem(index, field, Math.min(Math.max(val, 0), 100))
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>IVA *</Label>
                    <Select 
                      value={(getItemValue(item, 'taxRate')).toString()} 
                      onValueChange={(value) => {
                        const field = 'tax_rate' in item ? 'tax_rate' : 'taxRate'
                        onUpdateItem(index, field, parseFloat(value))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {getTaxRateLabel ? getTaxRateLabel(getItemValue(item, 'taxRate')) : `${getItemValue(item, 'taxRate')}%`}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">Exento</SelectItem>
                        <SelectItem value="-2">No Gravado</SelectItem>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="2.5">2.5%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="10.5">10.5%</SelectItem>
                        <SelectItem value="21">21%</SelectItem>
                        <SelectItem value="27">27%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Total</Label>
                    <div className="h-10 flex items-center justify-end px-3 bg-muted rounded-md font-medium">
                      {getCurrencySymbol(currency)}{itemTotals.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 text-sm border-t pt-2">
                <span className="text-muted-foreground">Subtotal: <span className="font-medium text-foreground">{getCurrencySymbol(currency)}{itemTotals.subtotal.toFixed(2)}</span></span>
                <span className="text-muted-foreground">IVA: <span className="font-medium text-foreground">{getCurrencySymbol(currency)}{(itemTotals.total - itemTotals.subtotal).toFixed(2)}</span></span>
                <span className="text-muted-foreground">Total: <span className="font-medium text-foreground">{getCurrencySymbol(currency)}{itemTotals.total.toFixed(2)}</span></span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
