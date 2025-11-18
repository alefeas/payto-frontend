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
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
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
    // Optimistic update: marcar como leída inmediatamente en la UI
    setMarkingAsRead(notification.id);
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Marcar como leída en el servidor
    const success = await notificationService.markAsRead(notification.id);
    if (!success) {
      // Si falla, revertir el cambio
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, read: notification.read } : n
      ));
      setUnreadCount(prev => prev + 1);
    }
    
    setMarkingAsRead(null);
    
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
    setMarkingAllAsRead(true);
    // Optimistic update: marcar todas como leídas inmediatamente
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    
    const success = await notificationService.markAllAsRead(companyId);
    if (!success) {
      // Si falla, recargar
      fetchNotifications();
    }
    
    setMarkingAllAsRead(false);
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
              className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1 bg-red-600 text-white text-xs font-medium-heading border-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 bg-white border border-gray-200 shadow-lg rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-medium-heading text-lg text-foreground">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              disabled={markingAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
            >
              {markingAllAsRead ? 'Marcando...' : 'Marcar todas como leídas'}
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Cargando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No hay notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const getNotificationColor = (type: string) => {
                if (type.includes('overdue') || type.includes('rejected')) return 'bg-red-100 text-red-800 border-red-200';
                if (type.includes('due_soon') || type.includes('reminder')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                if (type.includes('approved') || type.includes('paid') || type.includes('accepted')) return 'bg-green-100 text-green-800 border-green-200';
                return 'bg-blue-100 text-blue-800 border-blue-200';
              };
              
              const getShortMessage = (message: string) => {
                if (message.length > 60) return message.substring(0, 60) + '...';
                return message;
              };
              
              const isMarking = markingAsRead === notification.id;
              
              return (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200 last:border-b-0 ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  } ${isMarking ? 'opacity-60' : ''}`}
                  onClick={() => !isMarking && handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full flex-shrink-0 ${getNotificationColor(notification.type)} ${isMarking ? 'animate-pulse' : ''}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium-heading text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && !isMarking && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                        {isMarking && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {getShortMessage(notification.message)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="p-2 border-t border-gray-200">
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
