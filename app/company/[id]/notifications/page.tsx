'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notificationService, Notification } from '@/services/notification.service';
import { NotificationItem } from '@/components/notifications/notification-item';
import { NotificationSettings } from '@/components/notifications/notification-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCheck, Settings, Users, FileText, CreditCard, AlertTriangle, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(companyId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const renderNotifications = (unreadOnly = false) => {
    const filtered = unreadOnly
      ? notifications.filter(n => !n.read)
      : notifications;

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No hay notificaciones
        </div>
      );
    }

    return (
      <div className="border rounded-lg divide-y">
        {filtered.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => handleNotificationClick(notification)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        <Button
          onClick={handleMarkAllAsRead}
          disabled={notifications.length === 0}
          variant="outline"
          size="sm"
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Marcar todas como leídas
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread">No leídas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-4">
              {renderNotifications()}
            </TabsContent>
            
            <TabsContent value="unread" className="space-y-4 mt-4">
              {renderNotifications(true)}
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <NotificationSettings companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
