import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, MapPin, Search, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { APP_LOGO_SRC } from '../data/mockData';

interface HeroProps {
  onStartOrder: () => void;
  onTrackOrder: (code: string) => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartOrder, onTrackOrder, onExploreServices }) => {
  const [trackingCode, setTrackingCode] = useState('');

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      onTrackOrder(trackingCode.trim());
    }
  };

  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Value Proposition & Direct Tracking */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Brand Logo & Unboxed Metadata Kicker */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={APP_LOGO_SRC}
                alt="Lavandería Naty Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-sky-200 shadow-sm shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider">
                  <span>Lavandería Naty</span>
                  <span aria-hidden="true">·</span>
                  <span>Servicio a Domicilio</span>
                  <span aria-hidden="true">·</span>
                  <span>Rastreo en Vivo</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Cuidado artesanal y frescura garantizada
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
              Tu ropa limpia, seca y fresca sin salir de casa
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Lavado y secado por medida de canasto chico a <strong>$60</strong>. Puro lavado o puro secado a <strong>$40</strong>,
              cobertores desde <strong>$80</strong>, sábanas y frazadas. Agrega extras de jabón, suavizante o Pinol por solo <strong>$10 c/u</strong>.
            </p>

            {/* Quick CTAs */}
            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onStartOrder}
                className="px-6 py-3.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 active:bg-sky-800 transition-colors shadow-sm flex items-center justify-center gap-2 text-base whitespace-nowrap"
              >
                <span>Pedir Servicio a Domicilio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onExploreServices}
                className="px-5 py-3.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-base text-center whitespace-nowrap"
              >
                Ver Lista de Precios
              </button>
            </div>

            {/* Tracking Quick Input */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                ¿Ya tienes un pedido activo? Rastréalo aquí:
              </span>
              <form onSubmit={handleTrackingSubmit} className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Ej. NATY-1042 o tu teléfono"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Rastrear
                </button>
              </form>

              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span>Prueba pedidos demo:</span>
                <button
                  type="button"
                  onClick={() => onTrackOrder('NATY-1042')}
                  className="text-sky-700 font-medium hover:underline"
                >
                  NATY-1042 (En Lavado)
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onTrackOrder('NATY-1088')}
                  className="text-sky-700 font-medium hover:underline"
                >
                  NATY-1088 (En Camino)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Studio Image */}
          <div className="lg:col-span-5 relative flex items-center">
            <div className="w-full h-80 sm:h-96 lg:h-full min-h-[380px] rounded-2xl overflow-hidden shadow-md border border-slate-200/80 relative bg-slate-100">
              <img
                src="/src/assets/images/hero_laundry_fresh_1792897614419.jpg"
                alt="Lavandería Naty - Toallas y prendas limpias dobladas perfectamente en taller moderno"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                  Garantía Naty Impecable
                </span>
                <p className="text-sm font-medium mt-1 text-slate-100">
                  Separamos por color, cuidamos las telas delicadas y entregamos doblado o en ganchos con funda.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-sky-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-300" />
                    Entrega en 24h
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-sky-300" />
                    A tu puerta
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Value Pillars Strip (Full-width row below hero) */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recolección a Domicilio</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Vamos a tu casa o departamento en el horario que tú elijas. Sin cargar pesadas bolsas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rastreo en Tiempo Real</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Recibe notificaciones automáticas en tu celular cuando tu pedido cambie de etapa.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Múltiples Formas de Pago</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Efectivo al recibir, tarjeta de crédito o débito con terminal en tu puerta, SPEI o en línea.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Servicio Express Disponible</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ¿Urgencia con tus camisas o uniformes? Opción express para entrega en el mismo día.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
