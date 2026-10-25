import { NotificationSettings, OrderStatus, PushNotificationItem } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'lavanderia_naty_notifications';
const SETTINGS_STORAGE_KEY = 'lavanderia_naty_notification_settings';

export const DEFAULT_SETTINGS: NotificationSettings = {
  browserPush: false,
  soundAlerts: true,
  orderStatusUpdates: true,
  appointmentReminders: true,
  exclusiveOffers: true,
};

export const INITIAL_NOTIFICATIONS: PushNotificationItem[] = [
  {
    id: 'notif-1',
    title: '¡Ropa en proceso de lavado!',
    body: 'Tu pedido NATY-1042 ingresó a lavadoras industriales con aroma de Lavanda Francesa.',
    type: 'status_change',
    timestamp: 'Hace 15 min',
    read: false,
    orderId: 'NATY-1042',
    statusTarget: 'lavando',
  },
  {
    id: 'notif-2',
    title: 'Recordatorio de Entrega Hoy',
    body: 'El pedido NATY-1088 de Mariana Silva tiene entrega programada hoy entre 18:00 y 20:00.',
    type: 'appointment_reminder',
    timestamp: 'Hace 45 min',
    read: false,
    orderId: 'NATY-1088',
  },
  {
    id: 'notif-3',
    title: 'Oferta Exclusiva: 20% OFF en Edredones',
    body: 'Lava tus edredones y cobijas de invierno con 20% de descuento usando el código NATYFRESH en tu pedido.',
    type: 'exclusive_offer',
    timestamp: 'Hace 2 horas',
    read: true,
    promoCode: 'NATYFRESH',
    offerBadge: '20% OFF',
  },
];

// Play pleasant web audio chime
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.12);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.45);
  } catch {
    // Audio context may be restricted before user gesture
  }
}

// Request Browser Push Notification permission
export async function requestBrowserPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    if (granted) {
      updateNotificationSettings({ browserPush: true });
    }
    return granted;
  } catch {
    return false;
  }
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

// Show native browser notification if enabled
export function triggerNativeNotification(title: string, body: string, url?: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });

    notif.onclick = () => {
      window.focus();
      if (url) {
        window.location.hash = url;
      }
      notif.close();
    };
  } catch {
    // Ignore native notification errors
  }
}

// Get saved notifications
export function getSavedNotifications(): PushNotificationItem[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

// Save notifications
export function saveNotifications(notifications: PushNotificationItem[]) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('naty_notifications_updated', { detail: notifications }));
  } catch {
    // storage error
  }
}

// Get Settings
export function getNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Update Settings
export function updateNotificationSettings(partial: Partial<NotificationSettings>): NotificationSettings {
  const current = getNotificationSettings();
  const updated = { ...current, ...partial };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('naty_settings_updated', { detail: updated }));
  } catch {
    // storage error
  }
  return updated;
}

// Push a new notification into system
export function dispatchPushNotification(item: Omit<PushNotificationItem, 'id' | 'timestamp' | 'read'>) {
  const settings = getNotificationSettings();

  // Check filter
  if (item.type === 'status_change' && !settings.orderStatusUpdates) return;
  if (item.type === 'appointment_reminder' && !settings.appointmentReminders) return;
  if (item.type === 'exclusive_offer' && !settings.exclusiveOffers) return;

  const newItem: PushNotificationItem = {
    ...item,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: 'Justo ahora',
    read: false,
  };

  const list = [newItem, ...getSavedNotifications()];
  saveNotifications(list);

  if (settings.soundAlerts) {
    playNotificationChime();
  }

  if (settings.browserPush && getBrowserNotificationPermission() === 'granted') {
    triggerNativeNotification(item.title, item.body);
  }

  // Trigger toast banner event
  window.dispatchEvent(new CustomEvent('naty_toast_banner', { detail: newItem }));
}

// Helpers for specific notifications
export function notifyOrderStatusChange(orderId: string, status: OrderStatus, customNote?: string) {
  const statusTitles: Record<OrderStatus, string> = {
    solicitado: '¡Solicitud Recibida!',
    recolectando: '¡Repartidor en camino a tu domicilio!',
    en_taller: 'Prendas recibidas en taller Naty',
    lavando: 'Prendas en proceso de lavado y secado',
    doblado: 'Doblado cuidadoso y empaque protector',
    en_reparto: '¡Tus prendas van en camino a tu puerta!',
    entregado: '¡Pedido entregado con éxito!',
  };

  const statusBodies: Record<OrderStatus, string> = {
    solicitado: `Tu pedido ${orderId} ha sido registrado. En breve te asignamos recolector.`,
    recolectando: `Nuestro recolector va hacia tu domicilio para recibir tus canastos y prendas (${orderId}).`,
    en_taller: `Tus prendas llegaron al taller Naty. Están siendo medidas y clasificadas.`,
    lavando: `Tus prendas están en máquinas industriales con tus extras seleccionados (${orderId}).`,
    doblado: `Tus prendas están perfectamente dobladas y protegidas en bolsas limpias.`,
    en_reparto: `¡Tu ropa limpia y aromatizada está en ruta para entrega! Prepárate para recibirla.`,
    entregado: `Tu pedido ${orderId} fue entregado. ¡Esperamos que disfrutes la frescura de tus prendas!`,
  };

  dispatchPushNotification({
    title: statusTitles[status] || `Actualización en pedido ${orderId}`,
    body: customNote || statusBodies[status] || `El estado de tu pedido cambió a ${status}.`,
    type: 'status_change',
    orderId,
    statusTarget: status,
  });
}

export function notifyAppointmentReminder(orderId: string, type: 'pickup' | 'delivery', slot: string) {
  const title = type === 'pickup' ? 'Recordatorio de Recolección' : 'Recordatorio de Entrega';
  const body = type === 'pickup'
    ? `Hoy pasamos por tu ropa para el pedido ${orderId} en el horario de ${slot}. Ten tus prendas listas.`
    : `Hoy entregamos tu ropa limpia del pedido ${orderId} en el horario de ${slot}.`;

  dispatchPushNotification({
    title,
    body,
    type: 'appointment_reminder',
    orderId,
  });
}

export function notifyExclusiveOffer(title: string, body: string, promoCode?: string, offerBadge?: string) {
  dispatchPushNotification({
    title,
    body,
    type: 'exclusive_offer',
    promoCode,
    offerBadge,
  });
}
