export type OrderStatus =
  | 'solicitado'      // Solicitud recibida en sistema
  | 'recolectando'    // Repartidor en camino a recoger prendas
  | 'en_taller'       // Prendas en taller: conteo y clasificación por canastos
  | 'lavando'         // En proceso de lavado y centrifugado
  | 'doblado'         // Doblado perfecto y empaque protector
  | 'en_reparto'      // En camino de vuelta a tu domicilio
  | 'entregado';      // Pedido entregado satisfactoriamente

export type PaymentMethodType =
  | 'efectivo'            // Pago en efectivo al recibir
  | 'terminal_puerta'     // Terminal de tarjeta con el repartidor
  | 'tarjeta_en_linea'    // Pago con tarjeta en línea
  | 'spei_transferencia'  // Transferencia SPEI directa
  | 'mercado_pago';       // Mercado Pago / QR digital

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
  updatedBy: string;
}

export type ServiceCategory = 'ropa_canasto' | 'cobertores' | 'ropa_cama';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  unit: string;
  description: string;
  popular?: boolean;
}

export interface OrderItem {
  serviceId: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export interface OrderExtras {
  extraJabon: number;       // $10
  extraSuavizante: number;  // $10
  extraPinol: number;       // $10
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  reference: string;
}

export interface CarePreferences {
  detergent: 'hipoalergenico' | 'aroma_intenso' | 'ecologico' | 'desmanchador';
  fragrance: 'lavanda' | 'fresco_primaveral' | 'bebe' | 'sin_fragancia';
  softener: boolean;
  specialNotes: string;
}

export interface PaymentDetails {
  method: PaymentMethodType;
  status: 'pendiente' | 'pagado' | 'por_cobrar_en_entrega';
  cardLast4?: string;
  cardBrand?: string;
  speiClabe?: string;
  speiReference?: string;
  tipAmount?: number;
  discountCode?: string;
  discountAmount?: number;
}

export interface Order {
  id: string; // e.g., 'NATY-1042'
  customer: CustomerInfo;
  items: OrderItem[];
  canastosCount?: number;
  extras?: OrderExtras;
  carePreferences: CarePreferences;
  pickupDate: string;
  pickupSlot: string; // e.g. '09:00 - 12:00'
  deliveryDate: string;
  deliverySlot: string;
  deliveryType: 'estandar' | 'express';
  paymentMethod: PaymentMethodType;
  paymentDetails: PaymentDetails;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  driver?: {
    name: string;
    phone: string;
    vehicle: string;
    plate: string;
  };
  history: StatusHistoryItem[];
}

export type NotificationType =
  | 'status_change'           // Alerta de cambio de estado de pedido
  | 'appointment_reminder'    // Recordatorio de cita de recolección o entrega
  | 'exclusive_offer';        // Promoción u oferta exclusiva

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  orderId?: string;
  statusTarget?: OrderStatus;
  offerBadge?: string;
  promoCode?: string;
}

export interface NotificationSettings {
  browserPush: boolean;
  soundAlerts: boolean;
  orderStatusUpdates: boolean;
  appointmentReminders: boolean;
  exclusiveOffers: boolean;
}
