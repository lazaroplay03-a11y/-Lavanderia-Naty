import { INITIAL_SAMPLE_ORDERS } from '../data/mockData';
import { Order, OrderStatus } from '../types';
import { notifyOrderStatusChange } from './notifications';

const ORDERS_KEY = 'lavanderia_naty_orders_v2';
const ACTIVE_ORDER_ID_KEY = 'lavanderia_naty_active_order_id_v2';

export function getSavedOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_SAMPLE_ORDERS));
      return INITIAL_SAMPLE_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_SAMPLE_ORDERS));
      return INITIAL_SAMPLE_ORDERS;
    }
    return parsed;
  } catch {
    return INITIAL_SAMPLE_ORDERS;
  }
}

export function saveOrders(orders: Order[]) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('naty_orders_updated', { detail: orders }));
  } catch {
    // storage error
  }
}

export function getActiveOrderId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_ORDER_ID_KEY);
    if (id) return id;
    return 'NATY-1042';
  } catch {
    return 'NATY-1042';
  }
}

export function setActiveOrderId(orderId: string) {
  try {
    localStorage.setItem(ACTIVE_ORDER_ID_KEY, orderId);
    window.dispatchEvent(new CustomEvent('naty_active_order_changed', { detail: orderId }));
  } catch {
    // storage error
  }
}

export function getOrderById(id: string): Order | undefined {
  const orders = getSavedOrders();
  const search = id.trim().toUpperCase();
  return orders.find(
    (o) => o.id.toUpperCase() === search || o.customer.phone.replace(/\D/g, '').includes(search.replace(/\D/g, ''))
  );
}

export function createNewOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'status'>): Order {
  const existing = getSavedOrders();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newId = `NATY-${randomNum}`;

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newOrder: Order = {
    ...orderData,
    id: newId,
    status: 'solicitado',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    driver: {
      name: 'Roberto Gómez (Beto)',
      phone: '+52 55 8899 1122',
      vehicle: 'Moto-Furgón Naty #03',
      plate: 'NT-892-CD',
    },
    history: [
      {
        status: 'solicitado',
        timestamp: `${timeFormatted}`,
        note: `Pedido confirmado en Lavandería Naty. Recolección para ${orderData.pickupDate} (${orderData.pickupSlot}).`,
        updatedBy: 'Sistema Web Naty',
      },
    ],
  };

  const updatedOrders = [newOrder, ...existing];
  saveOrders(updatedOrders);
  setActiveOrderId(newId);

  // Notify customer
  notifyOrderStatusChange(
    newId,
    'solicitado',
    `¡Tu pedido ${newId} ha sido registrado! Pasaremos a tu domicilio el ${orderData.pickupDate} en el horario de ${orderData.pickupSlot}.`
  );

  return newOrder;
}

export function updateOrderStatus(orderId: string, nextStatus: OrderStatus, customNote?: string, updatedBy = 'Taller Naty'): Order | null {
  const orders = getSavedOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const current = orders[index];
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const defaultNotes: Record<OrderStatus, string> = {
    solicitado: 'Solicitud recibida en la plataforma.',
    recolectando: 'Repartidor asignado y en ruta hacia el domicilio para recolectar tus canastos y prendas.',
    en_taller: 'Prendas recibidas en taller Naty. Medición de canastos y clasificación por color.',
    lavando: 'Prendas en ciclo de lavado y secado con tus productos y extras seleccionados.',
    doblado: 'Prendas dobladas con esmero y colocadas en empaque protector limpio.',
    en_reparto: 'Ropa limpia y con fresco aroma en camino a tu puerta.',
    entregado: 'Prendas entregadas satisfactoriamente al cliente.',
  };

  const newHistoryItem = {
    status: nextStatus,
    timestamp: timeFormatted,
    note: customNote || defaultNotes[nextStatus],
    updatedBy,
  };

  const updatedOrder: Order = {
    ...current,
    status: nextStatus,
    updatedAt: now.toISOString(),
    history: [newHistoryItem, ...current.history],
  };

  orders[index] = updatedOrder;
  saveOrders(orders);

  // Dispatch push notification
  notifyOrderStatusChange(orderId, nextStatus, newHistoryItem.note);

  return updatedOrder;
}

// Next status step progression order
export const STATUS_PROGRESSION: OrderStatus[] = [
  'solicitado',
  'recolectando',
  'en_taller',
  'lavando',
  'doblado',
  'en_reparto',
  'entregado',
];

export function getNextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_PROGRESSION.indexOf(current);
  if (idx >= 0 && idx < STATUS_PROGRESSION.length - 1) {
    return STATUS_PROGRESSION[idx + 1];
  }
  return null;
}

export function getPreviousStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_PROGRESSION.indexOf(current);
  if (idx > 0) {
    return STATUS_PROGRESSION[idx - 1];
  }
  return null;
}
