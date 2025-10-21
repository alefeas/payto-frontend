"use client"

import { EntityForm } from "@/components/shared/EntityForm"
import { Supplier } from "@/services/supplier.service"

interface SupplierFormProps {
  supplier?: Supplier | null
  companyId: string
  onClose: () => void
  onSuccess: () => void
}

export function SupplierForm({ supplier, companyId, onClose, onSuccess }: SupplierFormProps) {
  return (
    <EntityForm
      type="supplier"
      entity={supplier}
      companyId={companyId}
      onClose={onClose}
      onSuccess={onSuccess}
      showBankFields={true}
    />
  )
}
