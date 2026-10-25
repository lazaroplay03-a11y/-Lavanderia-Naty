import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, HelpCircle, MapPin, Phone, ShieldCheck, Truck } from 'lucide-react';

export const CoverageAndFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿Cómo funciona la recolección y entrega a domicilio con Lavandería Naty?',
      a: 'Es muy sencillo: seleccionas tus servicios o kilos estimados en la app, indicas tu dirección y franja horaria preferida. Nuestro recolector pasa por tus prendas en nuestras bolsas seguras. En cuanto llegan a nuestro taller las pesamos digitalmente y puedes seguir cada etapa (lavado, secado, planchado y reparto) con notificaciones push en tiempo real.',
    },
    {
      q: '¿Qué formas de pago puedo utilizar?',
      a: 'Aceptamos: 1) Efectivo al recibir en tu puerta; 2) Terminal bancaria con el repartidor (tarjetas de débito o crédito Visa, Mastercard, AMEX y contactless con tu teléfono); 3) Pago seguro con tarjeta en línea; 4) Transferencia SPEI directa sin comisiones; 5) Mercado Pago con código QR.',
    },
    {
      q: '¿Cómo me llegan las notificaciones push de mi pedido?',
      a: 'Cuando activas las notificaciones push en la app, tu celular o navegador te alertará automáticamente: 1) cuando el repartidor esté en camino a tu domicilio, 2) cuando tus prendas ingresen al ciclo de lavado, 3) recordatorios de citas 1 hora antes, y 4) ofertas exclusivas y cupones de descuento.',
    },
    {
      q: '¿Qué pasa si no sé cuántos kilos pesa mi ropa?',
      a: 'No te preocupes. Puedes estimar una cantidad inicial en la app (una canasta regular suele pesar entre 4 y 5 kg). Nuestro recolector cuenta con báscula digital calibrada y registrará el pesaje exacto al recibir tu carga en taller.',
    },
    {
      q: '¿Cuánto tiempo tarda el servicio?',
      a: 'El servicio estándar se entrega en 24 horas hábiles. También contamos con servicio Express para entregas urgentes el mismo día (6 a 10 horas) con un pequeño cargo adicional.',
    },
    {
      q: '¿Cómo garantizan el cuidado de prendas delicadas?',
      a: 'Separamos minuciosamente prendas blancas, oscuras y de color. Si solicitas cuidado para telas delicadas (seda, lino, lana), utilizamos bolsas de malla protectora, detergente hipoalergénico pH neutro y secado a temperatura controlada.',
    },
  ];

  return (
    <section className="bg-slate-50 border-t border-slate-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Horarios y Zonas de Cobertura */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">
                <span>Atención y Cobertura</span>
                <span aria-hidden="true">·</span>
                <span>Lavandería Naty</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Horarios y Zonas de Entrega
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Servicio a domicilio continuo de lunes a sábado con vehículos propios equipados.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Ubicación de Taller Lavandería Naty</span>
                  <p className="text-slate-700 font-semibold mt-0.5">
                    Playa Paamul 1781, Colonia Ventura
                  </p>
                  <p className="text-slate-500">Reynosa, Tamaulipas</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Horarios de Atención y Rutas</span>
                  <p className="text-slate-600 mt-0.5">Lunes a Sábado: 07:30 AM – 08:30 PM</p>
                  <p className="text-slate-600">Domingos: 09:00 AM – 03:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Truck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Zonas de Entrega a Domicilio en Reynosa</span>
                  <p className="text-slate-600 mt-0.5">
                    Col. Ventura, Las Fuentes, Aztlán, Jarachina, Fracc. San José, Benito Juárez, Rodríguez, Hidalgo y zonas vecinas de Reynosa, Tam.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Phone className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Línea Telefónica y WhatsApp Naty</span>
                  <p className="text-slate-600 mt-0.5">+52 55 9876 5432 / +52 55 8899 1122</p>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                    Respuesta promedio en menos de 5 minutos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: FAQ Accordion */}
          <div className="lg:col-span-7">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-600" />
                <span>Preguntas Frecuentes</span>
              </h3>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900 hover:text-sky-700 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
