'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, AlertTriangle, Clock, CheckCircle, Users } from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  invoiceDueReminders: boolean;
  invoiceStatusChanges: boolean;
  paymentReminders: boolean;
  paymentStatusChanges: boolean;
  systemAlerts: boolean;
  connectionRequests: boolean;
  connectionStatusChanges: boolean;
}

interface NotificationSettingsProps {
  companyId: string;
}

export function NotificationSettings({ companyId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    invoiceDueReminders: true,
    invoiceStatusChanges: true,
    paymentReminders: true,
    paymentStatusChanges: true,
    systemAlerts: true,
    connectionRequests: true,
    connectionStatusChanges: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [companyId]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to load settings
      // const response = await fetch(`/api/company/${companyId}/notification-settings`);
      // const data = await response.json();
      // setSettings(data);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save settings
      // const response = await fetch(`/api/company/${companyId}/notification-settings`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });
      console.log('Notification settings saved:', settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const SettingItem = ({ 
    title, 
    description, 
    icon, 
    settingKey 
  }: { 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    settingKey: keyof NotificationSettings;
  }) => (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className="text-gray-500">
          {icon}
        </div>
        <div>
          <Label className="text-sm font-medium">{title}</Label>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <Switch
        checked={settings[settingKey]}
        onCheckedChange={(checked) => updateSetting(settingKey, checked)}
        disabled={isLoading}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Configuración de Notificaciones</span>
        </CardTitle>
        <CardDescription>
          Personaliza cómo recibes notificaciones sobre facturas, pagos y actividad de tu empresa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Preferencias Generales</h3>
          <SettingItem
            title="Notificaciones por Email"
            description="Recibe notificaciones importantes en tu correo electrónico"
            icon={<Mail className="h-4 w-4" />}
            settingKey="emailNotifications"
          />
          <SettingItem
            title="Notificaciones Push"
            description="Recibe notificaciones en tiempo real en tu navegador"
            icon={<Smartphone className="h-4 w-4" />}
            settingKey="pushNotifications"
          />
        </div>

        {/* Invoice Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notificaciones de Facturas</h3>
          <SettingItem
            title="Recordatorios de Vencimiento"
            description="Recibe recordatorios cuando las facturas estén por vencer o estén vencidas"
            icon={<Clock className="h-4 w-4" />}
            settingKey="invoiceDueReminders"
          />
          <SettingItem
            title="Cambios de Estado"
            description="Notificaciones cuando el estado de una factura cambie"
            icon={<CheckCircle className="h-4 w-4" />}
            settingKey="invoiceStatusChanges"
          />
        </div>

        {/* Payment Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notificaciones de Pagos</h3>
          <SettingItem
            title="Recordatorios de Pago"
            description="Recibe recordatorios sobre pagos pendientes"
            icon={<Clock className="h-4 w-4" />}
            settingKey="paymentReminders"
          />
          <SettingItem
            title="Cambios de Estado de Pago"
            description="Notificaciones cuando el estado de un pago cambie"
            icon={<CheckCircle className="h-4 w-4" />}
            settingKey="paymentStatusChanges"
          />
        </div>

        {/* System & Connection Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sistema y Conexiones</h3>
          <SettingItem
            title="Alertas del Sistema"
            description="Notificaciones importantes sobre el sistema y seguridad"
            icon={<AlertTriangle className="h-4 w-4" />}
            settingKey="systemAlerts"
          />
          <SettingItem
            title="Solicitudes de Conexión"
            description="Notificaciones cuando alguien solicita conectarse contigo"
            icon={<Users className="h-4 w-4" />}
            settingKey="connectionRequests"
          />
          <SettingItem
            title="Cambios en Conexiones"
            description="Notificaciones cuando el estado de una conexión cambie"
            icon={<CheckCircle className="h-4 w-4" />}
            settingKey="connectionStatusChanges"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={saveSettings} 
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}