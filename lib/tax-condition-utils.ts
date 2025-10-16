export const taxConditionTranslations: Record<string, string> = {
  'registered_taxpayer': 'Responsable Inscripto',
  'RI': 'Responsable Inscripto',
  'monotax': 'Monotributo',
  'Monotributo': 'Monotributo',
  'exempt': 'Exento',
  'Exento': 'Exento',
  'final_consumer': 'Consumidor Final',
  'CF': 'Consumidor Final',
  'final_consumer_alt': 'Consumidor Final',
  'not_specified': 'No especificado'
}

export function translateTaxCondition(taxCondition: string): string {
  return taxConditionTranslations[taxCondition] || taxCondition
}
