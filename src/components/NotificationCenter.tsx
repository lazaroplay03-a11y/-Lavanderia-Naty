import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  ExternalLink,
  Info,
  Radio,
  Settings2,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { NotificationSettings, NotificationType, PushNotificationItem } from '../types';
import {
  getBrowserNotificationPermission,
  getNotificationSettings,
  getSavedNotifications,
  notifyAppointmentReminder,
  notifyExclusiveOffer,
  notifyOrderStatusChange,
  playNotificationChime,
  requestBrowserPushPermission,
  saveNotifications,
  updateNotificationSettings,
} from '../utils/notifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
  onApplyPromoCode?: (code: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
  onApplyPromoCode,
}) => {
  const [notifications, setNotifications] = useState<PushNotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [activeTab, setActiveTab] = useState<'all' | 'status_change' | 'appointment_reminder' | 'exclusive_offer'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(getBrowserNotificationPermission());

  useEffect(() => {
    setNotifications(getSavedNotifications());
    setSettings(getNotificationSettings());
    setBrowserPermission(getBrowserNotificationPermission());

    const handleUpdate = (e: CustomEvent<PushNotificationItem[]>) => {
      setNotifications(e.detail);
    };

    const handleSettingsUpdate = (e: CustomEvent<NotificationSettings>) => {
      setSettings(e.detail);
    };

    window.addEventListener('naty_notifications_updated' as unknown as keyof WindowEventMap, handleUpdate as EventListener);
    window.addEventListener('naty_settings_updated' as unknown as keyof WindowEventMap, handleSettingsUpdate as EventListener);

    return () => {
      window.removeEventListener('naty_notifications_updated' as unknown as keyof WindowEventMap, handleUpdate as EventListener);
      window.removeEventListener('naty_settings_updated' as unknown as keyof WindowEventMap, handleSettingsUpdate as EventListener);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
  };

  const handleToggleRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
    saveNotifications(updated);
  };

  const handleRequestPush = async () => {
    const granted = await requestBrowserPushPermission();
    setBrowserPermission(getBrowserNotificationPermission());
    if (granted) {
      playNotificationChime();
    }
  };

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    const updated = updateNotificationSettings({ [key]: !settings[key] });
    setSettings(updated);
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-center-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="notification-center-title" className="text-base font-bold text-slate-900">
                Notificaciones Lavandería Naty
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{unreadCount} sin leer</span>
                <span aria-hidden="true">·</span>
                <span>Push en vivo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 transition-colors ${
                showSettings ? 'bg-sky-100 text-sky-800' : 'hover:bg-slate-100'
              }`}
              title="Configurar notificaciones"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Push Permission Banner */}
        {browserPermission !== 'granted' && (
          <div className="p-3.5 bg-sky-50 border-b border-sky-100 flex items-start gap-3 text-xs">
            <Radio className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-sky-900">Activa notificaciones del navegador</span>
              <p className="text-sky-700 mt-0.5">
                Recibe avisos inmediatos en tu pantalla cuando el repartidor esté cerca o tu ropa esté limpia.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRequestPush}
              className="px-3 py-1.5 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors shrink-0 whitespace-nowrap"
            >
              Permitir
            </button>
          </div>
        )}

        {/* Preferences Drawer */}
        {showSettings && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Preferencias de Notificaciones
              </span>
              <button
                type="button"
                onClick={playNotificationChime}
                className="flex items-center gap-1 text-sky-700 font-semibold hover:text-sky-900"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Probar sonido</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Cambios de estado</div>
                  <div className="text-[11px] text-slate-500">Recogido, lavando, en camino</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.orderStatusUpdates}
                  onChange={() => handleToggleSetting('orderStatusUpdates')}
                  className="w-4 h-4 text-sky-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Recordatorios de citas</div>
                  <div className="text-[11px] text-slate-500">Horarios de recolección y entrega</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.appointmentReminders}
                  onChange={() => handleToggleSetting('appointmentReminders')}
                  className="w-4 h-4 text-sky-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Ofertas y promociones</div>
                  <div className="text-[11px] text-slate-500">Descuentos exclusivos y cupones</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.exclusiveOffers}
                  onChange={() => handleToggleSetting('exclusiveOffers')}
                  className="w-4 h-4 text-sky-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Sonido de timbre</div>
                  <div className="text-[11px] text-slate-500">Campana de aviso en la app</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundAlerts}
                  onChange={() => handleToggleSetting('soundAlerts')}
                  className="w-4 h-4 text-sky-600 rounded"
                />
              </label>
            </div>

            {/* Test simulator actions */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">Simulador para demostración:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => notifyOrderStatusChange('NATY-1042', 'en_reparto', 'El repartidor Beto va en camino con tu ropa limpia.')}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  + Alerta Pedido
                </button>
                <button
                  type="button"
                  onClick={() => notifyAppointmentReminder('NATY-1042', 'pickup', '10:00 - 12:00')}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  + Cita
                </button>
                <button
                  type="button"
                  onClick={() => notifyExclusiveOffer('¡Oferta Flash Martes!', 'Planchado con 25% de descuento en pedidos mayores a $150.', 'MARTES25', '25% OFF')}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  + Oferta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('status_change')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'status_change' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pedidos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appointment_reminder')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'appointment_reminder' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recordatorios
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exclusive_offer')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'exclusive_offer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ofertas
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-sky-700 hover:text-sky-900 font-medium flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Leídas</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Limpiar todas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">No hay notificaciones en esta categoría</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Te avisaremos en cuanto haya cambios en tus pedidos, citas de recolección u ofertas especiales.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.read
                    ? 'bg-white border-slate-200'
                    : 'bg-sky-50/60 border-sky-200 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      item.type === 'status_change'
                        ? 'bg-sky-100 text-sky-700'
                        : item.type === 'appointment_reminder'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.type === 'status_change' && <Truck className="w-4 h-4" />}
                    {item.type === 'appointment_reminder' && <Clock className="w-4 h-4" />}
                    {item.type === 'exclusive_offer' && <Tag className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                          {item.type === 'status_change' && 'Estado'}
                          {item.type === 'appointment_reminder' && 'Cita'}
                          {item.type === 'exclusive_offer' && (item.offerBadge || 'Promo')}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400 tabular-nums">{item.timestamp}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleRead(item.id)}
                        className={`text-[11px] ${item.read ? 'text-slate-400' : 'text-sky-700 font-semibold'} hover:underline`}
                      >
                        {item.read ? 'Marcar no leída' : 'Marcar leída'}
                      </button>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{item.body}</p>

                    {/* Action buttons */}
                    <div className="mt-3 flex items-center gap-2">
                      {item.orderId && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectOrder(item.orderId!);
                            handleToggleRead(item.id);
                            onClose();
                          }}
                          className="px-3 py-1 bg-sky-600 text-white rounded-md text-xs font-medium hover:bg-sky-700 transition-colors flex items-center gap-1"
                        >
                          <span>Rastrear pedido {item.orderId}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {item.promoCode && onApplyPromoCode && (
                        <button
                          type="button"
                          onClick={() => {
                            onApplyPromoCode(item.promoCode!);
                            handleToggleRead(item.id);
                            onClose();
                          }}
                          className="px-3 py-1 bg-emerald-700 text-white rounded-md text-xs font-medium hover:bg-emerald-800 transition-colors flex items-center gap-1"
                        >
                          <span>Aplicar cupón: {item.promoCode}</span>
                          <Sparkles className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Canal de notificaciones activo</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-slate-700 hover:text-slate-900 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
