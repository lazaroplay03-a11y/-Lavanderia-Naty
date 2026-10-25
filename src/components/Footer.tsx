import React from 'react';
import { CreditCard, Heart, MapPin, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import { APP_LOGO_SRC } from '../data/mockData';

interface FooterProps {
  onNavigate: (view: 'home' | 'order' | 'track' | 'admin' | 'services') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <img
                src={APP_LOGO_SRC}
                alt="Lavandería Naty"
                className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow-xs"
              />
              <span>Lavandería Naty</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Lavado y secado por medida de canasto chico, cobertores, sábanas y frazadas con recolección y entrega a
              domicilio, rastreo en vivo y esmero artesanal.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantía de Satisfacción 100%</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition-colors"
                >
                  Servicios y Precios
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('order')}
                  className="hover:text-white transition-colors"
                >
                  Pedir a Domicilio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('track')}
                  className="hover:text-white transition-colors"
                >
                  Rastrear mi Pedido
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white transition-colors"
                >
                  Panel Operador Taller
                </button>
              </li>
            </ul>
          </div>

          {/* Formas de Pago */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Formas de Pago Aceptadas</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>· Efectivo contra entrega</li>
              <li>· Terminal móvil en tu puerta (Clip)</li>
              <li>· Tarjeta Visa, Mastercard y AMEX</li>
              <li>· Transferencia interbancaria SPEI</li>
              <li>· Mercado Pago / Billetera QR</li>
            </ul>
          </div>

          {/* Contacto directo */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Contacto y Taller</h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Playa Paamul 1781, Col. Ventura, Reynosa, Tamaulipas</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>+52 55 9876 5432</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: +52 55 8899 1122</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <div>
            © {new Date().getFullYear()} Lavandería Naty. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span>Rastreo en tiempo real</span>
            <span aria-hidden="true">·</span>
            <span>Notificaciones Push activadas</span>
            <span aria-hidden="true">·</span>
            <span>Entrega a domicilio</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
