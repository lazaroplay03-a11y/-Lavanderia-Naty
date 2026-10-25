import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Tag,
  Truck,
  UserCheck,
} from 'lucide-react';
import { APP_LOGO_SRC, STATUS_STEPS } from '../data/mockData';
import { Order, OrderStatus } from '../types';
import { notifyAppointmentReminder, notifyExclusiveOffer } from '../utils/notifications';
import {
  getNextStatus,
  getSavedOrders,
  saveOrders,
  setActiveOrderId,
  updateOrderStatus,
} from '../utils/storage';

interface AdminTallerPanelProps {
  onSelectOrderToTrack: (orderId: string) => void;
}

export const AdminTallerPanel: React.FC<AdminTallerPanelProps> = ({ onSelectOrderToTrack }) => {
  const [orders, setOrders] = useState<Order[]>(getSavedOrders());
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForNotes, setSelectedOrderForNotes] = useState<string | null>(null);
  const [customNoteInput, setCustomNoteInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Quick promo broadcast modal state
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    title: '¡Fin de semana de Cobertores!',
    body: 'Aprovecha 20% de descuento en lavado de cobertores king y matrimoniales.',
    code: 'NATYFRESH',
    badge: '20% OFF',
  });

  const refreshOrders = () => {
    setOrders(getSavedOrders());
  };

  useEffect(() => {
    refreshOrders();

    const handleUpdate = () => {
      refreshOrders();
    };

    window.addEventListener('naty_orders_updated' as unknown as keyof WindowEventMap, handleUpdate as EventListener);
    return () => {
      window.removeEventListener('naty_orders_updated' as unknown as keyof WindowEventMap, handleUpdate as EventListener);
    };
  }, []);

  const handleAdvanceStatus = (order: Order) => {
    const next = getNextStatus(order.status);
    if (!next) return;

    const note = customNoteInput.trim() ? customNoteInput.trim() : undefined;
    const updated = updateOrderStatus(order.id, next, note, 'Operador Taller Naty');
    if (updated) {
      refreshOrders();
      setFeedbackMsg(`Pedido ${order.id} avanzado a: ${next.replace('_', ' ')}`);
      setCustomNoteInput('');
      setSelectedOrderForNotes(null);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleSendReminder = (order: Order) => {
    notifyAppointmentReminder(order.id, 'pickup', `${order.pickupDate} (${order.pickupSlot})`);
    setFeedbackMsg(`Recordatorio push enviado al cliente ${order.customer.name}`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleBroadcastPromo = (e: React.FormEvent) => {
    e.preventDefault();
    notifyExclusiveOffer(promoForm.title, promoForm.body, promoForm.code, promoForm.badge);
    setShowPromoModal(false);
    setFeedbackMsg('¡Oferta exclusiva enviada por Push a todos los clientes!');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'todos' && o.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      return (
        o.id.toLowerCase().includes(s) ||
        o.customer.name.toLowerCase().includes(s) ||
        o.customer.phone.includes(s)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <img
            src={APP_LOGO_SRC}
            alt="Lavandería Naty"
            className="w-12 h-12 rounded-full object-cover border border-sky-200 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 mb-0.5">
              <span>Panel de Taller & Logística</span>
              <span aria-hidden="true">·</span>
              <span>Lavandería Naty</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Gestión y Control de Pedidos a Domicilio
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cambia los estados de pedidos con un clic para alertar a los clientes en tiempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPromoModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Emitir Oferta Push</span>
          </button>

          <button
            type="button"
            onClick={refreshOrders}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            title="Recargar pedidos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <span>{feedbackMsg}</span>
          <button type="button" onClick={() => setFeedbackMsg(null)} className="text-emerald-600 font-bold">
            x
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Pedidos</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{orders.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">En Taller / Lavando</span>
          <div className="text-2xl font-bold text-sky-700 mt-1 tabular-nums">
            {orders.filter((o) => o.status === 'en_taller' || o.status === 'lavando' || o.status === 'doblado').length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">En Reparto Activo</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">
            {orders.filter((o) => o.status === 'recolectando' || o.status === 'en_reparto').length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Entregados Hoy</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
            {orders.filter((o) => o.status === 'entregado').length}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'solicitado', label: '1. Solicitados' },
            { id: 'recolectando', label: '2. En Recolección' },
            { id: 'en_taller', label: '3. En Taller' },
            { id: 'lavando', label: '4. Lavando' },
            { id: 'doblado', label: '5. Doblado y Empaque' },
            { id: 'en_reparto', label: '6. En Reparto' },
            { id: 'entregado', label: '7. Entregados' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, id o cel..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
          />
        </div>
      </div>

      {/* Orders Table / Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No hay pedidos en esta categoría</h4>
            <p className="text-xs text-slate-500 mt-1">Todos los pedidos están atendidos o filtrados.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            const isEditingNotes = selectedOrderForNotes === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center font-black text-sm">
                      {order.id.split('-')[1]}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{order.id}</h3>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-slate-700">{order.customer.name}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{order.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{order.customer.address}, {order.customer.neighborhood}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-slate-700">Total: ${order.total}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'entregado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'en_reparto' || order.status === 'recolectando'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-sky-100 text-sky-900'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectOrderToTrack(order.id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Ver Rastreo
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendReminder(order)}
                      className="px-2.5 py-1 text-sky-700 hover:bg-sky-50 border border-sky-200 rounded-lg text-xs font-medium flex items-center gap-1"
                      title="Enviar recordatorio de cita"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Recordatorio</span>
                    </button>
                  </div>
                </div>

                {/* Items and care instructions */}
                <div className="py-3 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  <div className="md:col-span-6">
                    <span className="font-bold text-slate-700 block mb-1">Prendas y Servicios:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {order.items.map((it, i) => (
                        <span key={i} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                          {it.quantity} {it.unit} {it.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-6">
                    <span className="font-bold text-slate-700 block mb-1">Cuidado Naty:</span>
                    <div className="text-slate-600">
                      <span>Detergente: {order.carePreferences.detergent} · Aroma: {order.carePreferences.fragrance}</span>
                      {order.carePreferences.specialNotes && (
                        <p className="italic text-slate-500 mt-0.5">"{order.carePreferences.specialNotes}"</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Advance Action Row */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span>Recolección: {order.pickupDate} ({order.pickupSlot})</span>
                    <span aria-hidden="true"> · </span>
                    <span>Entrega: {order.deliveryDate} ({order.deliverySlot})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {nextStatus ? (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(order)}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Avanzar a: {nextStatus.replace('_', ' ')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completado</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Promo Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Emitir Oferta Exclusiva Push a Clientes</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Esta alerta sonará y aparecerá en las pantallas de los clientes como una notificación push instantánea.
            </p>

            <form onSubmit={handleBroadcastPromo} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Título de la Oferta</label>
                <input
                  type="text"
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Descripción del Descuento</label>
                <textarea
                  rows={2}
                  value={promoForm.body}
                  onChange={(e) => setPromoForm({ ...promoForm, body: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Código de Cupón</label>
                  <input
                    type="text"
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Etiqueta</label>
                  <input
                    type="text"
                    value={promoForm.badge}
                    onChange={(e) => setPromoForm({ ...promoForm, badge: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Notificación Push</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
