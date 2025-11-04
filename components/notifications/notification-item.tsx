import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, FileText, CreditCard, Users, AlertTriangle, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Notification } from '@/services/notification.service';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
        "p-4 hover:bg-accent cursor-pointer transition-colors border-b last:border-b-0",
        !notification.read && "bg-blue-50 dark:bg-blue-950"
      )}
    >
      <div className="flex gap-3">
        <Avatar className={cn(
          'bg-opacity-10',
          notification.type === 'invoice_overdue' || notification.type === 'invoice_due_reminder' ? 'bg-red-100 text-red-600' :
          notification.type === 'invoice_due_soon' ? 'bg-yellow-100 text-yellow-600' :
          notification.type === 'invoice_status_changed' || notification.type === 'payment_status_changed' ? 
            (notification.data.newStatus === 'approved' || notification.data.newStatus === 'paid' || notification.data.newStatus === 'confirmed' || notification.data.newStatus === 'connection_accepted' ? 'bg-green-100 text-green-600' :
             notification.data.newStatus === 'rejected' || notification.data.newStatus === 'cancelled' || notification.data.newStatus === 'connection_rejected' ? 'bg-red-100 text-red-600' :
             'bg-blue-100 text-blue-600') :
          notification.type === 'system_alert' || notification.type === 'invoice_needs_review' ? 'bg-orange-100 text-orange-600' :
          'bg-blue-100 text-blue-600'
        )}>
          <AvatarFallback className={cn(
            'bg-opacity-10',
            notification.type === 'invoice_overdue' || notification.type === 'invoice_due_reminder' ? 'bg-red-100 text-red-600' :
            notification.type === 'invoice_due_soon' ? 'bg-yellow-100 text-yellow-600' :
            notification.type === 'invoice_status_changed' || notification.type === 'payment_status_changed' ? 
              (notification.data.newStatus === 'approved' || notification.data.newStatus === 'paid' || notification.data.newStatus === 'confirmed' || notification.data.newStatus === 'connection_accepted' ? 'bg-green-100 text-green-600' :
               notification.data.newStatus === 'rejected' || notification.data.newStatus === 'cancelled' || notification.data.newStatus === 'connection_rejected' ? 'bg-red-100 text-red-600' :
               'bg-blue-100 text-blue-600') :
            notification.type === 'system_alert' || notification.type === 'invoice_needs_review' ? 'bg-orange-100 text-orange-600' :
            'bg-blue-100 text-blue-600'
          )}>
            <div className={getIconColor()}>
              {getIcon()}
            </div>
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2" />
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {notification.companyName}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
