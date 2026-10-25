import React, { useEffect, useState } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { APP_LOGO_SRC } from '../data/mockData';
import { getSavedNotifications } from '../utils/notifications';

interface NavbarProps {
  activeView: 'home' | 'order' | 'track' | 'admin' | 'services';
  onNavigate: (view: 'home' | 'order' | 'track' | 'admin' | 'services') => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, onNavigate, onOpenNotifications }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const items = getSavedNotifications();
      setUnreadCount(items.filter((i) => !i.read).length);
    };

    updateCount();
    window.addEventListener('naty_notifications_updated' as unknown as keyof WindowEventMap, updateCount as EventListener);
    return () => {
      window.removeEventListener('naty_notifications_updated' as unknown as keyof WindowEventMap, updateCount as EventListener);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark with Logo */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-sky-700 transition-colors flex items-center gap-2.5"
        >
          <img
            src={APP_LOGO_SRC}
            alt="Lavandería Naty"
            className="w-10 h-10 rounded-full object-cover border border-sky-100 shadow-xs"
          />
          <span className="font-extrabold tracking-tight">Lavandería Naty</span>
        </button>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'home' ? 'text-sky-700 font-semibold underline underline-offset-8 decoration-2 decoration-sky-600' : ''
            }`}
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'services' ? 'text-sky-700 font-semibold underline underline-offset-8 decoration-2 decoration-sky-600' : ''
            }`}
          >
            Servicios y Precios
          </button>
          <button
            type="button"
            onClick={() => onNavigate('order')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'order' ? 'text-sky-700 font-semibold underline underline-offset-8 decoration-2 decoration-sky-600' : ''
            }`}
          >
            Pedir a Domicilio
          </button>
          <button
            type="button"
            onClick={() => onNavigate('track')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'track' ? 'text-sky-700 font-semibold underline underline-offset-8 decoration-2 decoration-sky-600' : ''
            }`}
          >
            Rastrear Pedido
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'admin' ? 'text-sky-700 font-semibold underline underline-offset-8 decoration-2 decoration-sky-600' : ''
            }`}
          >
            Panel Taller
          </button>
        </nav>

        {/* Zone 3: Notification Bell and Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notificaciones push de pedidos y ofertas"
            aria-label="Ver notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-sky-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('order')}
            className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 active:bg-sky-800 transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            Pedir Servicio
          </button>
        </div>
      </div>
    </header>
  );
};
