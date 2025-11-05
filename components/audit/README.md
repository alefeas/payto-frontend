# Sistema de Auditoría - Componentes Frontend

Este documento describe los componentes de auditoría implementados en el sistema PayTo.

## 📋 Componentes Principales

### 1. **AuditDashboardStats** (`audit-dashboard-stats.tsx`)
- **Propósito**: Mostrar estadísticas generales de auditoría
- **Características**: 
  - Total de eventos
  - Acciones únicas
  - Usuarios activos
  - Eventos recientes
  - Estado de carga y manejo de errores

### 2. **AuditFilters** (`audit-filters.tsx`)
- **Propósito**: Filtros avanzados para logs de auditoría
- **Filtros disponibles**:
  - Acción
  - Tipo de entidad
  - ID de entidad
  - Usuario
  - Dirección IP
  - Descripción (búsqueda por texto)
  - Rango de fechas
- **Características adicionales**: Exportación a CSV

### 3. **AuditLogsTable** (`audit-logs-table.tsx`)
- **Propósito**: Tabla para mostrar logs de auditoría
- **Características**:
  - Búsqueda en tiempo real
  - Vista detallada de logs
  - Visualización de metadatos
  - Estilos específicos por acción
  - Estados de carga

### 4. **AuditPagination** (`audit-pagination.tsx`)
- **Propósito**: Paginación para la tabla de auditoría
- **Características**:
  - Navegación entre páginas
  - Mostrar rango de resultados
  - Estados de carga

### 5. **AuditSearchAdvanced** (`audit-search-advanced.tsx`)
- **Propósito**: Búsqueda avanzada con filtros
- **Características**:
  - Barra de búsqueda principal
  - Filtros desplegables
  - Historial de búsqueda
  - Limpieza de filtros

### 6. **AuditMetadataViewer** (`audit-metadata-viewer.tsx`)
- **Propósito**: Visualizar metadatos de auditoría de forma interactiva
- **Características**:
  - Formateo JSON
  - Resaltado de sintaxis
  - Función copiar al portapapeles
  - Diálogo desplazable para contenido grande

### 7. **AuditExportButton** (`audit-export-button.tsx`)
- **Propósito**: Botón para exportar logs a CSV
- **Características**:
  - Gestión de estado de exportación
  - Integración con servicio de auditoría
  - Feedback al usuario vía toast

### 8. **AuditDashboardWidget** (`audit-dashboard-widget.tsx`)
- **Propósito**: Widget de dashboard con estadísticas de auditoría
- **Características**:
  - Tarjetas de estadísticas con gradientes
  - Acciones principales
  - Eventos recientes con formato de tiempo relativo
  - Enlace a página completa de auditoría

### 9. **AuditNotifications** (`audit-notifications.tsx`)
- **Propósito**: Notificaciones basadas en logs de auditoría
- **Características**:
  - Filtros por tipo y severidad
  - Estados de lectura/no leídas
  - Tipos: seguridad, sistema, usuario, error
  - Severidad: baja, media, alta, crítica

### 10. **AuditSkeletons** (`audit-skeletons.tsx`)
- **Propósito**: Estados de carga elegantes
- **Componentes**:
  - `AuditLoadingSkeleton`: Para página completa
  - `AuditTableSkeleton`: Para tabla de logs

### 11. **AuditEmptyState** (`audit-empty-state.tsx`)
- **Propósito**: Estados vacíos amigables
- **Tipos**:
  - Sin resultados de búsqueda
  - Sin logs disponibles
  - Sin permisos

### 12. **RecentActivity** (`recent-activity.tsx`)
- **Propósito**: Actividad reciente para dashboard
- **Características**:
  - Lista compacta de eventos
  - Estados de carga
  - Estilos por tipo de acción

## 🎯 Integración en Páginas

### Página de Auditoría (`/company/[id]/audit-log`)
- DashboardStats con estadísticas
- SearchAdvanced con búsqueda y filtros
- Filters con exportación CSV
- Table con visualización de logs
- Pagination para navegación
- Skeletons y Empty States

### Dashboard Principal (`/company/[id]`)
- AuditDashboardWidget en sidebar
- Reemplaza a RecentActivity con más funcionalidades

### Página de Notificaciones (`/company/[id]/notifications`)
- Nueva pestaña "Auditoría" con AuditNotifications
- Integración con sistema de notificaciones existente

## 🎨 Características de Diseño

### Temas y Estilos
- Gradientes modernos para tarjetas de estadísticas
- Iconos de Lucide React
- Componentes UI de Shadcn/ui
- Diseño responsive

### Estados de Carga
- Skeletons elegantes con animaciones
- Estados de carga en todos los componentes
- Feedback visual durante operaciones

### Interactividad
- Hover effects
- Transiciones suaves
- Feedback inmediato
- Toast notifications con Sonner

## 🔧 Servicios Utilizados

### AuditService
- `getCompanyAuditLogs()`: Obtener logs paginados
- `getAuditStats()`: Obtener estadísticas
- `exportAuditLogsToCsv()`: Exportar a CSV

### Integración con Sistema
- File-saver para descargas
- Sonner para notificaciones
- Date-fns para formateo de fechas
- Lucide-react para iconos

## 📱 Responsive Design

Todos los componentes están diseñados para ser:
- Mobile-first
- Adaptables a diferentes tamaños de pantalla
- Con scroll horizontal en tablas cuando sea necesario
- Con layouts de grid flexibles

## 🔒 Seguridad y Permisos

- Verificación de permisos antes de mostrar componentes
- Validación de datos en el frontend
- Manejo seguro de errores
- No exposición de información sensible

## 🚀 Optimización de Rendimiento

- Paginación del lado del servidor
- Carga diferida de componentes
- Memoización de componentes pesados
- Manejo eficiente de estados