# Auditoría: corrección de 404 y mejoras de logging

Este documento resume el problema de rutas que causaba 404 en auditoría y los cambios aplicados tanto en frontend como en backend.

## Síntoma
- Peticiones a auditoría desde el frontend devolvían `404 Not Found`.
- Ejemplo: `GET http://localhost:8000/api/v1/companies/{companyId}/audit-logs/...` sin autenticación debía devolver `401`, pero se observaba `404` al consumir desde el frontend.

## Causa raíz
- El cliente HTTP del frontend usa `NEXT_PUBLIC_API_URL = http://localhost:8000/api` como base.
- Las rutas del servicio de auditoría incluían el prefijo `/api/v1/...`, generando una URL duplicada: `http://localhost:8000/api/api/v1/...`.

## Cambios realizados

### Frontend
- Archivo: `services/audit.service.ts`.
- Se removió el prefijo `/api/v1` en todas las rutas del servicio y se dejó el path relativo desde `/companies/...`.
- Ejemplo actualizado: `GET /companies/{companyId}/audit-logs/recent?limit=5`.

### Backend
- Se creó `ModelAuditObserver` y se registró en `AppServiceProvider` para modelos clave (`Client`, `Supplier`, `Invoice`, `Payment`, `Collection`, `CompanySalesPoint`, `BankAccount`, `Company`, `CompanyMember`).
- Esto habilita logging automático de `create/update/delete` con metadatos y `company_id`.

## Cómo verificar
1. Backend:
   - `GET http://localhost:8000/api/health` debe responder `{ status: "ok" }`.
   - `GET http://localhost:8000/api/v1/companies/{companyId}/audit-logs/recent?limit=5` debe responder `401 Unauthorized` si no hay token (confirma que la ruta existe).
2. Frontend:
   - Ejecutar `npm run dev` en `payto-front`.
   - Navegar a `http://localhost:3001/company/{companyId}/audit-log`.
   - Confirmar que no hay error 404 y que se muestran estados de carga/tabla vacía si no hay datos.

## Consideraciones
- Mantener `NEXT_PUBLIC_API_URL` apuntando a `http://localhost:8000/api` y NO volver a anteponer `/api` o `/v1` en los paths del servicio.
- El backend maneja el prefijo `/api/v1` internamente; el frontend solo debe especificar el path de recursos (`/companies/...`).

## Próximos pasos sugeridos
- Auditar eventos de autenticación (login/logout) para usuarios: emitir logs via `AuditService` en `AuthService`.
- Revisar consistencia de `company_id` en modelos y operaciones que afectan auditoría.
- Añadir una vista de "Audit Trail" detallada por entidad usando `getAuditTrail`.