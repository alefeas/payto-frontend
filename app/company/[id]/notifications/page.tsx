'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notificationService, Notification } from '@/services/notification.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NotificationsSkeleton } from '@/components/notifications/NotificationsSkeleton';
import { Bell, CheckCheck, Clock, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(companyId, false);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [companyId]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    }

    const { entityType, entityId } = notification.data;
    if (entityType === 'invoice' && entityId) {
      router.push(`/company/${companyId}/invoices/${entityId}`);
    } else if (entityType === 'payment' && entityId) {
      router.push(`/company/${companyId}/payments/${entityId}`);
    } else if (entityType === 'connection' && entityId) {
      router.push(`/company/${companyId}/network`);
    }
  };

  if (loading) {
    return <NotificationsSkeleton />;
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(companyId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationColor = (type: string) => {
    if (type.includes('overdue') || type.includes('rejected')) return 'bg-red-100 text-red-800 border-red-200';
    if (type.includes('due_soon') || type.includes('reminder')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (type.includes('approved') || type.includes('paid') || type.includes('accepted')) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('overdue') || type.includes('due')) return <Clock className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <BackButton href={`/company/${companyId}`} />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Notificaciones</h1>
              <p className="text-sm sm:text-base text-muted-foreground truncate">
                {unreadCount > 0 
                  ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                  : 'Todas tus notificaciones están al día'
                }
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="w-full sm:w-auto h-12"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Marcar todas como leídas</span>
              <span className="sm:hidden">Marcar leídas</span>
            </Button>
          )}
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Mis Notificaciones
                </CardTitle>
                <CardDescription>
                  Mantente informado sobre eventos importantes de tu empresa
                </CardDescription>
              </div>
              <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="unread">
                    No leídas {unreadCount > 0 && `(${unreadCount})`}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')}>
              <TabsList className="hidden">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="unread">No leídas</TabsTrigger>
              </TabsList>
              
              <TabsContent value={filter} className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Inbox className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-1">
                      {filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {filter === 'unread' 
                        ? 'Todas tus notificaciones están al día'
                        : 'Cuando recibas notificaciones, aparecerán aquí'
                      }
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm relative ${
                        notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {!notification.read && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 pr-3">
                          <h4 className={`text-sm font-medium-heading mb-1 ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-xs mb-2 ${
                            notification.read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                            <span className="text-xs text-gray-500 truncate">
                              {notification.companyName}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.createdAt), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
