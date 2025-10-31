'use client';

import { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/services/notification.service';
import { NotificationItem } from '@/components/notifications/notification-item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useParams } from 'next/navigation';

export default function NotificationsPage() {
  const params = useParams();
  const companyId = params.id as string;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(
        companyId,
        filter === 'unread'
      );
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [companyId, filter]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      fetchNotifications();
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
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-12 bg-muted rounded animate-pulse"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Notificaciones</h1>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unread">No leídas</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
