"use client"

import { EntityForm } from "@/components/shared/EntityForm"
import { Client } from "@/services/client.service"

interface ClientFormProps {
  client?: Client | null
  companyId: string
  onClose: () => void
  onSuccess: (createdClient?: any) => void
}

export function ClientForm({ client, companyId, onClose, onSuccess }: ClientFormProps) {
  return (
    <EntityForm
      type="client"
      entity={client}
      companyId={companyId}
      onClose={onClose}
      onSuccess={onSuccess}
      showBankFields={false}
    />
  )
}
