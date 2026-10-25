import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock, Sparkles, Tag, Truck, X } from 'lucide-react';
import { PushNotificationItem } from '../types';

interface ToastBannerProps {
  onSelectOrder?: (orderId: string) => void;
  onOpenNotifications?: () => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ onSelectOrder, onOpenNotifications }) => {
  const [currentToast, setCurrentToast] = useState<PushNotificationItem | null>(null);

  useEffect(() => {
    const handleToast = (e: CustomEvent<PushNotificationItem>) => {
      setCurrentToast(e.detail);
    };

    window.addEventListener('naty_toast_banner' as unknown as keyof WindowEventMap, handleToast as EventListener);
    return () => {
      window.removeEventListener('naty_toast_banner' as unknown as keyof WindowEventMap, handleToast as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!currentToast) return;
    const timer = setTimeout(() => {
      setCurrentToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [currentToast]);

  if (!currentToast) return null;

  const getIcon = () => {
    switch (currentToast.type) {
      case 'status_change':
        return <Truck className="w-5 h-5 text-sky-600" />;
      case 'appointment_reminder':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'exclusive_offer':
        return <Tag className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-sky-600" />;
    }
  };

  const getBgStyle = () => {
    switch (currentToast.type) {
      case 'status_change':
        return 'border-sky-200 bg-white/95';
      case 'appointment_reminder':
        return 'border-amber-200 bg-white/95';
      case 'exclusive_offer':
        return 'border-emerald-200 bg-white/95';
      default:
        return 'border-slate-200 bg-white/95';
    }
  };

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div
        className={`p-4 rounded-xl shadow-lg border backdrop-blur-md ${getBgStyle()} flex items-start gap-3 relative`}
      >
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-sky-950 uppercase tracking-wider">
              {currentToast.type === 'status_change' && 'Estado de Pedido'}
              {currentToast.type === 'appointment_reminder' && 'Recordatorio'}
              {currentToast.type === 'exclusive_offer' && 'Oferta Exclusiva'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Ahora</span>
          </div>

          <h4 className="text-sm font-semibold text-slate-900 leading-snug">
            {currentToast.title}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
            {currentToast.body}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            {currentToast.orderId && onSelectOrder && (
              <button
                type="button"
                onClick={() => {
                  onSelectOrder(currentToast.orderId!);
                  setCurrentToast(null);
                }}
                className="text-xs font-semibold text-sky-700 hover:text-sky-800 underline underline-offset-2"
              >
                Rastrear {currentToast.orderId}
              </button>
            )}

            {onOpenNotifications && (
              <button
                type="button"
                onClick={() => {
                  onOpenNotifications();
                  setCurrentToast(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Ver todas las alertas
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentToast(null)}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
