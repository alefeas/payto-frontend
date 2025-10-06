# Script to translate Spanish field names to English across the project

$replacements = @{
    # Invoice types
    'InvoiceConcepto' = 'InvoiceConcept'
    "'productos'" = "'products'"
    "'servicios'" = "'services'"
    "'productos_servicios'" = "'products_services'"
    '"productos"' = '"products"'
    '"servicios"' = '"services"'
    '"productos_servicios"' = '"products_services"'
    "'percepcion_iva'" = "'vat_perception'"
    "'percepcion_iibb'" = "'gross_income_perception'"
    "'percepcion_suss'" = "'suss_perception'"
    '"percepcion_iva"' = '"vat_perception"'
    '"percepcion_iibb"' = '"gross_income_perception"'
    '"percepcion_suss"' = '"suss_perception"'
    
    # Invoice fields
    'puntoVenta:' = 'salesPoint:'
    'numeroComprobante:' = 'voucherNumber:'
    'afipTipoComprobante:' = 'afipVoucherType:'
    'concepto:' = 'concept:'
    'monedaCotizacion:' = 'exchangeRate:'
    
    # Client and Company fields
    'tipoDocumento:' = 'documentType:'
    'numeroDocumento:' = 'documentNumber:'
    'razonSocial:' = 'businessName:'
    'nombre:' = 'firstName:'
    'apellido:' = 'lastName:'
    'telefono:' = 'phone:'
    'domicilio:' = 'address:'
    'ingresosBrutos:' = 'grossIncomeTax:'
    'inicioActividades:' = 'activityStartDate:'
    'puntoVentaDefault:' = 'defaultSalesPoint:'
    
    # Variable names
    '.tipoDocumento' = '.documentType'
    '.numeroDocumento' = '.documentNumber'
    '.razonSocial' = '.businessName'
    '.nombre' = '.firstName'
    '.apellido' = '.lastName'
    '.telefono' = '.phone'
    '.domicilio' = '.address'
    '.ingresosBrutos' = '.grossIncomeTax'
    '.inicioActividades' = '.activityStartDate'
    '.puntoVentaDefault' = '.defaultSalesPoint'
    '.concepto' = '.concept'
    'condicionIva:' = 'taxCondition:'
    '.condicionIva' = '.taxCondition'
    
    # Object keys
    'tipo_documento' = 'documentType'
    'numero_documento' = 'documentNumber'
    'razon_social' = 'businessName'
    'condicion_iva' = 'taxCondition'
}

$extensions = @('*.ts', '*.tsx', '*.js', '*.jsx')
$directories = @('app', 'components', 'contexts', 'lib', 'hooks')

foreach ($dir in $directories) {
    $path = Join-Path $PSScriptRoot $dir
    if (Test-Path $path) {
        Write-Host "Processing directory: $dir"
        
        foreach ($ext in $extensions) {
            $files = Get-ChildItem -Path $path -Filter $ext -Recurse -File
            
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw -Encoding UTF8
                $modified = $false
                
                foreach ($key in $replacements.Keys) {
                    if ($content -match [regex]::Escape($key)) {
                        $content = $content -replace [regex]::Escape($key), $replacements[$key]
                        $modified = $true
                    }
                }
                
                if ($modified) {
                    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                    Write-Host "  Updated: $($file.Name)"
                }
            }
        }
    }
}

Write-Host "`nTranslation complete!"
