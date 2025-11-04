'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { notificationService, Notification } from '@/services/notification.service';
import { NotificationItem } from './notification-item';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  companyId: string;
}

export function NotificationBell({ companyId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications(companyId),
        notificationService.getUnreadCount(companyId)
      ]);
      
      setNotifications(notificationsData.slice(0, 5));
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Show user-friendly error notification
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchNotifications();
      
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [companyId]);

  const handleNotificationClick = async (notification: Notification) => {
    const success = await notificationService.markAsRead(notification.id);
    if (success) {
      // Refresh notifications after marking as read
      fetchNotifications();
    }
    
    // Navigate based on entity type or notification type
    const { entityType, entityId } = notification.data;
    if (entityType === 'invoice' && entityId) {
      router.push(`/company/${companyId}/invoices/${entityId}`);
    } else if (entityType === 'payment' && entityId) {
      router.push(`/company/${companyId}/payments/${entityId}`);
    } else if (entityType === 'connection' && entityId) {
      router.push(`/company/${companyId}/network`);
    } else if (notification.type === 'invoice_due_soon' || notification.type === 'invoice_overdue' || notification.type === 'invoice_due_reminder') {
      router.push(`/company/${companyId}/invoices?status=due`);
    } else if (notification.type === 'invoice_status_changed') {
      if (entityId) {
        router.push(`/company/${companyId}/invoices/${entityId}`);
      } else {
        router.push(`/company/${companyId}/invoices`);
      }
    } else if (notification.type === 'payment_status_changed') {
      if (entityId) {
        router.push(`/company/${companyId}/payments/${entityId}`);
      } else {
        router.push(`/company/${companyId}/payments`);
      }
    } else if (notification.type === 'system_alert' || notification.type === 'invoice_needs_review') {
      router.push(`/company/${companyId}/dashboard`);
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    const success = await notificationService.markAllAsRead(companyId);
    if (success) {
      fetchNotifications();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-accent/50 transition-all duration-200 group"
          disabled={isLoading}
        >
          <Bell className={cn(
            "h-5 w-5 transition-all duration-200",
            isLoading && "animate-pulse",
            unreadCount > 0 && "text-primary group-hover:text-primary/80"
          )} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
                "animate-bounce transition-all duration-300 hover:scale-110"
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-sm bg-popover border border-border shadow-lg rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg text-foreground">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No hay notificaciones</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Te notificaremos cuando haya novedades</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))
          )}
        </div>
        <div className="p-2 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200" 
            onClick={() => {
              router.push(`/company/${companyId}/notifications`);
              setIsOpen(false);
            }}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
