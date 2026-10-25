import React, { useState } from 'react';
import { ArrowRight, Check, Droplets, Info, Plus, Sparkles, Wind } from 'lucide-react';
import { APP_LOGO_SRC, SERVICES_CATALOG, SERVICE_EXTRAS } from '../data/mockData';
import { ServiceCategory, ServiceItem } from '../types';

interface ServicesCatalogProps {
  onSelectServiceToOrder: (serviceId?: string) => void;
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({ onSelectServiceToOrder }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos los servicios' },
    { id: 'ropa_canasto', label: 'Ropa (Canasto Chico)' },
    { id: 'cobertores', label: 'Cobertores' },
    { id: 'ropa_cama', label: 'Sábanas & Frazadas' },
  ];

  const filtered = SERVICES_CATALOG.filter(
    (s) => selectedCategory === 'todos' || s.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Title with Naty Logo */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img
            src={APP_LOGO_SRC}
            alt="Lavandería Naty"
            className="w-12 h-12 rounded-full object-cover border border-sky-200 shadow-xs"
          />
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-2">
          <span>Precios Oficiales Lavandería Naty</span>
          <span aria-hidden="true">·</span>
          <span>Sin Cargos Ocultos</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Nuestros Servicios y Tarifas
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Servicio por medida de canasto chico a $60, puro lavado o secado a $40, y lavado profundo de cobertores y sábanas.
        </p>
      </div>

      {/* Extras Highlight Banner ($10 c/u) */}
      <div className="mb-10 bg-gradient-to-r from-sky-50 via-emerald-50/50 to-sky-50 rounded-2xl border border-sky-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded">
              Extras Especiales
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Personaliza tu Lavado por solo $10 pesos extra
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Puedes agregar dosis adicionales a cualquier servicio al realizar tu pedido a domicilio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectServiceToOrder('lavado-secado-canasto')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
          >
            Hacer Pedido con Extras
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SERVICE_EXTRAS.map((extra) => (
            <div
              key={extra.id}
              className="bg-white/90 rounded-xl p-3.5 border border-slate-200 flex items-start justify-between gap-3"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900">{extra.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{extra.description}</p>
              </div>
              <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md tabular-nums shrink-0">
                +${extra.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === c.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-sky-300 hover:shadow-xs transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
                  {item.category === 'ropa_canasto' && 'Ropa por Canasto'}
                  {item.category === 'cobertores' && 'Cobertores'}
                  {item.category === 'ropa_cama' && 'Ropa de Cama'}
                </span>
                {item.popular && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Popular
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-900 leading-snug">{item.name}</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 tabular-nums">${item.price}</span>
                <span className="text-xs text-slate-500 ml-1">/ {item.unit}</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectServiceToOrder(item.id)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pedir a Domicilio</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Included standard */}
      <div className="mt-12 p-6 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs">
        <h4 className="font-bold text-sky-950 text-sm mb-3">En Lavandería Naty te garantizamos:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sky-900">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Medición clara de canasto chico sin sorpresas</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Secado parejo y libre de humedad interior</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Doblado impecable listo para guardar</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Rastreo en tiempo real a tu celular</span>
          </div>
        </div>
      </div>
    </div>
  );
};
