import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, FileText, CreditCard, Users, AlertTriangle, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Notification } from '@/services/notification.service';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const getIcon = () => {
    // First check notification type for specific icons
    switch (notification.type) {
      case 'invoice_due_soon':
      case 'invoice_overdue':
      case 'invoice_due_reminder':
        return <Clock className="h-4 w-4" />;
      case 'invoice_status_changed':
        const status = notification.data.newStatus;
        if (status === 'approved' || status === 'paid') {
          return <CheckCircle className="h-4 w-4" />;
        } else if (status === 'rejected' || status === 'cancelled') {
          return <XCircle className="h-4 w-4" />;
        }
        return <AlertCircle className="h-4 w-4" />;
      case 'payment_status_changed':
        const paymentStatus = notification.data.newStatus;
        if (paymentStatus === 'confirmed') {
          return <CheckCircle className="h-4 w-4" />;
        } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
          return <XCircle className="h-4 w-4" />;
        }
        return <CreditCard className="h-4 w-4" />;
      case 'system_alert':
      case 'invoice_needs_review':
        return <AlertTriangle className="h-4 w-4" />;
      case 'connection_accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'connection_rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        // Fall back to entity type for basic icons
        switch (notification.data.entityType) {
          case 'invoice':
            return <FileText className="h-4 w-4" />;
          case 'payment':
            return <CreditCard className="h-4 w-4" />;
          case 'connection':
            return <Users className="h-4 w-4" />;
          default:
            return <Bell className="h-4 w-4" />;
        }
    }
  };

  const getNotificationType = () => {
    switch (notification.type) {
      case 'invoice_due_soon':
        return 'Vencimiento próximo';
      case 'invoice_overdue':
        return 'Factura vencida';
      case 'invoice_due_reminder':
        return 'Recordatorio de vencimiento';
      case 'invoice_status_changed':
        return 'Estado de factura actualizado';
      case 'payment_status_changed':
        return 'Estado de pago actualizado';
      case 'system_alert':
        return 'Alerta del sistema';
      case 'invoice_needs_review':
        return 'Revisión requerida';
      case 'connection_accepted':
        return 'Conexión aceptada';
      case 'connection_rejected':
        return 'Conexión rechazada';
      case 'invoice_received':
        return 'Factura recibida';
      case 'invoice_pending_approval':
        return 'Factura pendiente de aprobación';
      case 'payment_received':
        return 'Pago recibido';
      case 'payment_reminder':
        return 'Recordatorio de pago';
      case 'connection_request':
        return 'Solicitud de conexión';
      default:
        return 'Notificación';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'invoice_overdue':
      case 'invoice_due_reminder':
        return 'text-red-500';
      case 'invoice_due_soon':
        return 'text-yellow-500';
      case 'invoice_status_changed':
        const status = notification.data.newStatus;
        if (status === 'approved' || status === 'paid') {
          return 'text-green-500';
        } else if (status === 'rejected' || status === 'cancelled') {
          return 'text-red-500';
        }
        return 'text-blue-500';
      case 'payment_status_changed':
        const paymentStatus = notification.data.newStatus;
        if (paymentStatus === 'confirmed') {
          return 'text-green-500';
        } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
          return 'text-red-500';
        }
        return 'text-blue-500';
      case 'system_alert':
      case 'invoice_needs_review':
        return 'text-orange-500';
      case 'connection_accepted':
        return 'text-green-500';
      case 'connection_rejected':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 hover:bg-accent/50 cursor-pointer transition-all duration-200 border-b border-border last:border-b-0 group",
        !notification.read && "bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary"
      )}
    >
      <div className="flex gap-4">
        <div className="relative flex-shrink-0">
          <Avatar className={cn(
            'h-10 w-10 transition-all duration-200 group-hover:scale-105',
            notification.type === 'invoice_overdue' || notification.type === 'invoice_due_reminder' ? 'bg-red-100 text-red-600 border-2 border-red-200' :
            notification.type === 'invoice_due_soon' ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200' :
            notification.type === 'invoice_status_changed' || notification.type === 'payment_status_changed' ? 
              (notification.data.newStatus === 'approved' || notification.data.newStatus === 'paid' || notification.data.newStatus === 'confirmed' || notification.data.newStatus === 'connection_accepted' ? 'bg-green-100 text-green-600 border-2 border-green-200' :
               notification.data.newStatus === 'rejected' || notification.data.newStatus === 'cancelled' || notification.data.newStatus === 'connection_rejected' ? 'bg-red-100 text-red-600 border-2 border-red-200' :
               'bg-blue-100 text-blue-600 border-2 border-blue-200') :
            notification.type === 'system_alert' || notification.type === 'invoice_needs_review' ? 'bg-orange-100 text-orange-600 border-2 border-orange-200' :
            'bg-blue-100 text-blue-600 border-2 border-blue-200'
          )}>
            <AvatarFallback className={cn(
              'bg-transparent text-current',
              !notification.read && 'font-semibold'
            )}>
              <div className={cn(getIconColor(), "transition-transform duration-200 group-hover:scale-110")}>
                {getIcon()}
              </div>
            </AvatarFallback>
          </Avatar>
          {!notification.read && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={cn(
                "text-sm font-medium text-foreground transition-colors duration-200",
                !notification.read && "font-semibold"
              )}>
                {notification.title}
              </p>
              <Badge 
                variant="outline" 
                className="text-xs mt-1 px-2 py-0 border-primary/20 text-primary/70"
              >
                {getNotificationType()}
              </Badge>
            </div>
            <div className="flex-shrink-0">
              <time className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </time>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {notification.message}
          </p>
          {notification.companyName && (
            <p className="text-xs text-muted-foreground/70 mt-2 font-medium">
              {notification.companyName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
