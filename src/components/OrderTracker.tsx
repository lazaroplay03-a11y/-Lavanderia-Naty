import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FastForward,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Play,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  Volume2,
} from 'lucide-react';
import { APP_LOGO_SRC, STATUS_STEPS } from '../data/mockData';
import { Order, OrderStatus } from '../types';
import { notifyAppointmentReminder, playNotificationChime } from '../utils/notifications';
import {
  getActiveOrderId,
  getNextStatus,
  getOrderById,
  getPreviousStatus,
  getSavedOrders,
  setActiveOrderId,
  updateOrderStatus,
} from '../utils/storage';

interface OrderTrackerProps {
  initialOrderId?: string;
  onNewOrderClick: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ initialOrderId, onNewOrderClick }) => {
  const [searchInput, setSearchInput] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Load order
  const loadOrder = (id: string) => {
    const found = getOrderById(id);
    if (found) {
      setCurrentOrder(found);
      setActiveOrderId(found.id);
    } else {
      const all = getSavedOrders();
      if (all.length > 0) {
        setCurrentOrder(all[0]);
        setActiveOrderId(all[0].id);
      }
    }
  };

  useEffect(() => {
    const targetId = initialOrderId || getActiveOrderId();
    loadOrder(targetId);

    const handleOrdersUpdated = () => {
      const activeId = getActiveOrderId();
      const updated = getOrderById(activeId);
      if (updated) setCurrentOrder(updated);
    };

    const handleActiveChanged = (e: CustomEvent<string>) => {
      loadOrder(e.detail);
    };

    window.addEventListener('naty_orders_updated' as unknown as keyof WindowEventMap, handleOrdersUpdated as EventListener);
    window.addEventListener('naty_active_order_changed' as unknown as keyof WindowEventMap, handleActiveChanged as EventListener);

    return () => {
      window.removeEventListener('naty_orders_updated' as unknown as keyof WindowEventMap, handleOrdersUpdated as EventListener);
      window.removeEventListener('naty_active_order_changed' as unknown as keyof WindowEventMap, handleActiveChanged as EventListener);
    };
  }, [initialOrderId]);

  // Auto simulator effect
  useEffect(() => {
    if (!autoSimulate || !currentOrder) return;

    const interval = setInterval(() => {
      if (!currentOrder) return;
      const next = getNextStatus(currentOrder.status);
      if (next) {
        const updated = updateOrderStatus(currentOrder.id, next, undefined, 'Simulador en Tiempo Real');
        if (updated) {
          setCurrentOrder(updated);
          setStatusFeedback(`¡Estado actualizado en vivo a: ${next.replace('_', ' ')}!`);
          setTimeout(() => setStatusFeedback(null), 3000);
        }
      } else {
        setAutoSimulate(false);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [autoSimulate, currentOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = getOrderById(searchInput.trim());
    if (found) {
      setCurrentOrder(found);
      setActiveOrderId(found.id);
      setSearchInput('');
    } else {
      alert(`No encontramos un pedido con el código o teléfono: "${searchInput}". Prueba con NATY-1042 o NATY-1088.`);
    }
  };

  const handleManualAdvanceStatus = () => {
    if (!currentOrder) return;
    const next = getNextStatus(currentOrder.status);
    if (next) {
      const updated = updateOrderStatus(currentOrder.id, next, undefined, 'Control Manual Cliente');
      if (updated) {
        setCurrentOrder(updated);
        setStatusFeedback(`¡Avanzado a: ${next.replace('_', ' ')}!`);
        setTimeout(() => setStatusFeedback(null), 2500);
      }
    }
  };

  const handleResetStatus = () => {
    if (!currentOrder) return;
    const updated = updateOrderStatus(currentOrder.id, 'solicitado', 'Pedido reiniciado para demostración.', 'Simulador');
    if (updated) {
      setCurrentOrder(updated);
      setStatusFeedback('Pedido reiniciado a etapa inicial.');
      setTimeout(() => setStatusFeedback(null), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    if (!currentOrder) return;
    const text = `Hola Lavandería Naty, consulto el estatus de mi pedido ${currentOrder.id} a nombre de ${currentOrder.customer.name}. Estado actual: ${currentOrder.status}.`;
    const url = `https://wa.me/525598765432?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!currentOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Cargando pedido...</h3>
      </div>
    );
  }

  const currentStepObj = STATUS_STEPS.find((s) => s.id === currentOrder.status);
  const currentStepNum = currentStepObj ? currentStepObj.stepNumber : 1;
  const progressPercent = Math.round((currentStepNum / STATUS_STEPS.length) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Quick Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <img
            src={APP_LOGO_SRC}
            alt="Lavandería Naty"
            className="w-12 h-12 rounded-full object-cover border border-sky-200 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-0.5">
              <span>Rastreador en Tiempo Real</span>
              <span aria-hidden="true">·</span>
              <span>Lavandería Naty</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Pedido {currentOrder.id}</span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {currentOrder.deliveryType === 'express' ? 'Servicio Express' : 'Servicio Estándar'}
              </span>
            </h2>
          </div>
        </div>

        {/* Search & Order Chips */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar pedido o teléfono..."
              className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
            />
          </form>

          <button
            type="button"
            onClick={onNewOrderClick}
            className="px-3.5 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition-colors whitespace-nowrap shadow-xs"
          >
            + Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Quick sample orders switch bar */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap">Cambiar a pedido:</span>
        {getSavedOrders().map((ord) => (
          <button
            key={ord.id}
            type="button"
            onClick={() => {
              setCurrentOrder(ord);
              setActiveOrderId(ord.id);
            }}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              ord.id === currentOrder.id
                ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {ord.id} ({ord.customer.name.split(' ')[0]}) - {ord.status}
          </button>
        ))}
      </div>

      {/* Simulator Control Box */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-sky-50 via-sky-50/50 to-slate-50 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-sky-950">Simulador de Rastreo en Tiempo Real</span>
            <p className="text-[11px] text-sky-700">
              Prueba cómo el cliente recibe alertas push y ve el avance en vivo de su ropa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
          {statusFeedback && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
              {statusFeedback}
            </span>
          )}

          <button
            type="button"
            onClick={handleManualAdvanceStatus}
            disabled={currentOrder.status === 'entregado'}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Avanzar Estado</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 ${
              autoSimulate
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${autoSimulate ? 'fill-current' : ''}`} />
            <span>{autoSimulate ? 'Pausar Simulación' : 'Simular en Vivo'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetStatus}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg"
            title="Reiniciar a Solicitado"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Stepper & Active Status Spotlight */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Status Spotlight Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  Etapa Actual #{currentStepNum} de 7
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {currentStepObj?.label}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                  {currentStepObj?.longDesc}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl sm:text-3xl font-extrabold text-sky-700 tabular-nums">
                  {progressPercent}%
                </span>
                <span className="block text-[11px] text-slate-400">Progreso total</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-sky-600 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Stepper Timeline Horizontal / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-100">
              {STATUS_STEPS.map((step) => {
                const isPassed = step.stepNumber < currentStepNum;
                const isCurrent = step.stepNumber === currentStepNum;

                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-50/60 shadow-xs ring-1 ring-sky-400'
                        : isPassed
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                            isCurrent ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {step.stepNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 truncate">{step.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{step.shortDesc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Driver Spotlight (Visible when driver is in route) */}
          {currentOrder.driver && (currentOrder.status === 'recolectando' || currentOrder.status === 'en_reparto') && (
            <div className="p-5 rounded-2xl bg-white border border-sky-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                      {currentOrder.status === 'recolectando'
                        ? 'Repartidor en camino a tu casa'
                        : 'Repartidor con tus prendas en ruta'}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-600">En ruta</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{currentOrder.driver.name}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {currentOrder.driver.vehicle} · Placas: <span className="font-mono font-semibold">{currentOrder.driver.plate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${currentOrder.driver.phone}`}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Llamar Chofer</span>
                </a>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* History Event Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Bitácora de Eventos del Pedido</span>
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {currentOrder.history.map((hist, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-sky-600 ring-4 ring-sky-100" />
                  <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 capitalize">
                        {hist.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums">{hist.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600">{hist.note}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">Registrado por: {hist.updatedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Details & Receipt */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer & Address Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Datos de Entrega y Cuidado
            </h4>

            <div>
              <span className="text-slate-400 block text-[11px]">Cliente:</span>
              <span className="font-semibold text-slate-800">{currentOrder.customer.name}</span>
              <span className="text-slate-500 block">{currentOrder.customer.phone}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Dirección de Recolección y Entrega:</span>
              <span className="font-medium text-slate-800 block">{currentOrder.customer.address}</span>
              <span className="text-slate-500 block">{currentOrder.customer.neighborhood}</span>
              {currentOrder.customer.reference && (
                <span className="text-slate-400 italic block mt-0.5 text-[11px]">
                  Ref: {currentOrder.customer.reference}
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Recolección:</span>
                <span className="font-semibold text-slate-800">{currentOrder.pickupDate}</span>
                <span className="text-slate-500 block text-[11px]">{currentOrder.pickupSlot}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Entrega programada:</span>
                <span className="font-semibold text-slate-800">{currentOrder.deliveryDate}</span>
                <span className="text-slate-500 block text-[11px]">{currentOrder.deliverySlot}</span>
              </div>
            </div>

            {/* Custom Care specifics & Extras */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-1">Cuidado Seleccionado:</span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded text-[11px] font-medium">
                  {currentOrder.carePreferences.detergent}
                </span>
                <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded text-[11px] font-medium">
                  Aroma: {currentOrder.carePreferences.fragrance}
                </span>
              </div>

              {currentOrder.extras && (currentOrder.extras.extraJabon > 0 || currentOrder.extras.extraSuavizante > 0 || currentOrder.extras.extraPinol > 0) && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-1">Extras Añadidos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentOrder.extras.extraJabon > 0 && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        +{currentOrder.extras.extraJabon} Extra Jabón ($10)
                      </span>
                    )}
                    {currentOrder.extras.extraSuavizante > 0 && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        +{currentOrder.extras.extraSuavizante} Extra Suavizante ($10)
                      </span>
                    )}
                    {currentOrder.extras.extraPinol > 0 && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        +{currentOrder.extras.extraPinol} Extra Pinol ($10)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {currentOrder.carePreferences.specialNotes && (
                <p className="text-[11px] text-slate-600 mt-2 italic">
                  "{currentOrder.carePreferences.specialNotes}"
                </p>
              )}
            </div>
          </div>

          {/* Payment & Items Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs">
            <h4 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-3">
              Desglose de Pago
            </h4>

            <div className="space-y-2 mb-4">
              {currentOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <div>
                    <span className="font-medium">{it.name}</span>
                    <span className="text-[11px] text-slate-400 block">
                      {it.quantity} {it.unit} x ${it.unitPrice}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums text-slate-900">
                    ${it.quantity * it.unitPrice}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="tabular-nums font-medium">${currentOrder.subtotal}</span>
              </div>

              {currentOrder.paymentDetails.discountAmount && currentOrder.paymentDetails.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Descuento ({currentOrder.paymentDetails.discountCode}):</span>
                  <span className="tabular-nums">-${currentOrder.paymentDetails.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Envío a domicilio:</span>
                <span className="tabular-nums font-medium">
                  {currentOrder.deliveryFee === 0 ? 'GRATIS' : `$${currentOrder.deliveryFee}`}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total:</span>
                <span className="tabular-nums text-sky-900">${currentOrder.total}</span>
              </div>
            </div>

            {/* Payment Method Badge */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Forma de Pago
                </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {currentOrder.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  currentOrder.paymentDetails.status === 'pagado'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {currentOrder.paymentDetails.status === 'pagado' ? 'Pagado' : 'Cobrar en Entrega'}
              </span>
            </div>

            {/* WhatsApp receipt action */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Enviar Estado por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
