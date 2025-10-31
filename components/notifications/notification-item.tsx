import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, FileText, CreditCard, Users } from 'lucide-react';
import { Notification } from '@/services/notification.service';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const getIcon = () => {
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
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          !notification.read ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
        )}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </p>
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
