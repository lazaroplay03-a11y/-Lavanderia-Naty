import { Order, OrderStatus, ServiceItem } from '../types';

export const APP_LOGO_SRC = '/assets/aistudio/FB_IMG_1791653632464_137965d7.jpg';

export const NATY_ADDRESS = {
  street: 'Playa Paamul 1781',
  colony: 'Colonia Ventura',
  city: 'Reynosa',
  state: 'Tamaulipas',
  full: 'Playa Paamul 1781, Colonia Ventura, Reynosa, Tamaulipas',
};

export const SERVICES_CATALOG: ServiceItem[] = [
  // Ropa por medida de canasto chico
  {
    id: 'lavado-secado-canasto',
    name: 'Lavado y Secado de Ropa (Medida Canasto Chico)',
    category: 'ropa_canasto',
    price: 60,
    unit: 'medida',
    description: 'Medida canasto chico estándar. Separado por color, lavado suave, secado completo y doblado impecable.',
    popular: true,
  },
  {
    id: 'puro-lavado-canasto',
    name: 'Puro Lavado (1 Medida Canasto Chico)',
    category: 'ropa_canasto',
    price: 40,
    unit: 'medida',
    description: 'Lavado profundo con centrifugado. Ideal si prefieres secar tus prendas en casa.',
  },
  {
    id: 'puro-secado-canasto',
    name: 'Puro Secado (1 Medida Canasto Chico)',
    category: 'ropa_canasto',
    price: 40,
    unit: 'medida',
    description: 'Secado en secadora industrial a temperatura óptima para eliminar humedad y pelusas.',
  },

  // Cobertores
  {
    id: 'cobertor-individual',
    name: 'Lavado y Secado de Cobertor Individual',
    category: 'cobertores',
    price: 80,
    unit: 'pieza',
    description: 'Lavado y secado completo para cobertor individual. Esponjoso y con agradable aroma fresco.',
  },
  {
    id: 'cobertor-matrimonial',
    name: 'Lavado y Secado de Cobertor Matrimonial',
    category: 'cobertores',
    price: 90,
    unit: 'pieza',
    description: 'Lavado profundo y secado parejo para cobertores tamaño matrimonial.',
    popular: true,
  },
  {
    id: 'cobertor-king',
    name: 'Lavado y Secado de Cobertor King Size',
    category: 'cobertores',
    price: 120,
    unit: 'pieza',
    description: 'Lavado en tambor de gran capacidad para cobertores King Size. Totalmente seco y desinfectado.',
  },
  {
    id: 'cobertor-king-aborregado',
    name: 'Lavado y Secado Cobertor King Size Aborregado',
    category: 'cobertores',
    price: 150,
    unit: 'pieza',
    description: 'Cuidado especializado para tela aborregada o térmica gruesa sin apelmazar el borrego.',
  },

  // Ropa de cama
  {
    id: 'sabana-pieza',
    name: 'Lavado y Secado de Sábana por Pieza',
    category: 'ropa_cama',
    price: 30,
    unit: 'pieza',
    description: 'Sábana plana o de cajón limpia, suave y lista para usar.',
  },
  {
    id: 'frazada-pieza',
    name: 'Lavado y Secado de Frazada por Pieza',
    category: 'ropa_cama',
    price: 50,
    unit: 'pieza',
    description: 'Frazadas y mantas de descanso limpias, suaves al tacto y aromatizadas.',
  },
];

export const SERVICE_EXTRAS = [
  {
    id: 'extraJabon',
    name: 'Extra de Jabón',
    price: 10,
    description: 'Dosis adicional de detergente concentrado para cargas con ropa muy sucia.',
  },
  {
    id: 'extraSuavizante',
    name: 'Extra de Suavizante',
    price: 10,
    description: 'Dosis extra de suavizante premium para mayor suavidad y aroma prolongado.',
  },
  {
    id: 'extraPinol',
    name: 'Extra de Pinol',
    price: 10,
    description: 'Adición de Pinol desinfectante y aromatizante con poder desengrasante natural.',
  },
];

export const STATUS_STEPS: {
  id: OrderStatus;
  stepNumber: number;
  label: string;
  shortDesc: string;
  longDesc: string;
}[] = [
  {
    id: 'solicitado',
    stepNumber: 1,
    label: 'Solicitud Recibida',
    shortDesc: 'Registrado en sistema Naty',
    longDesc: 'Tu solicitud a domicilio ha sido confirmada. Estamos programando al repartidor para la recolección.',
  },
  {
    id: 'recolectando',
    stepNumber: 2,
    label: 'Repartidor en Ruta',
    shortDesc: 'En camino a tu domicilio',
    longDesc: 'El recolector de Lavandería Naty va hacia tu domicilio para recibir tus canastos y prendas.',
  },
  {
    id: 'en_taller',
    stepNumber: 3,
    label: 'Recepción en Taller',
    shortDesc: 'Medición de canastos y conteo',
    longDesc: 'Tus prendas llegaron a nuestro taller. Verificamos la medida de canastos y separamos por color.',
  },
  {
    id: 'lavando',
    stepNumber: 4,
    label: 'Lavado y Secado',
    shortDesc: 'Ciclo activo con tus extras',
    longDesc: 'Tus prendas están en máquinas industriales con el detergente, suavizante o Pinol seleccionado.',
  },
  {
    id: 'doblado',
    stepNumber: 5,
    label: 'Doblado y Empaque',
    shortDesc: 'Doblado cuidadoso y protección',
    longDesc: 'Prendas dobladas con esmero y colocadas en bolsas protectoras limpias listas para entrega.',
  },
  {
    id: 'en_reparto',
    stepNumber: 6,
    label: 'En Camino a Entrega',
    shortDesc: 'Repartidor rumbo a tu puerta',
    longDesc: 'Tu ropa limpia y con fresco aroma está en la camioneta de reparto rumbo a tu domicilio.',
  },
  {
    id: 'entregado',
    stepNumber: 7,
    label: 'Entregado Impecable',
    shortDesc: 'Servicio finalizado con éxito',
    longDesc: '¡Ropa entregada en tu hogar! Gracias por confiar en el esmero y cariño de Lavandería Naty.',
  },
];

export const PAYMENT_METHODS_DATA: {
  id: Order['paymentMethod'];
  name: string;
  description: string;
  iconType: string;
  badgeText: string;
}[] = [
  {
    id: 'efectivo',
    name: 'Efectivo al Recibir',
    description: 'Pagas en efectivo directamente al repartidor cuando entregue tu ropa limpia.',
    iconType: 'cash',
    badgeText: 'Sin cargos extra',
  },
  {
    id: 'terminal_puerta',
    name: 'Terminal con Tarjeta en tu Puerta',
    description: 'El repartidor lleva terminal móvil para pagar con tarjeta de débito o crédito (Visa, Mastercard, Carnet).',
    iconType: 'terminal',
    badgeText: 'Clip / MercadoPago',
  },
  {
    id: 'tarjeta_en_linea',
    name: 'Pago con Tarjeta en Línea',
    description: 'Paga de forma rápida y segura con tarjeta de débito o crédito desde la app.',
    iconType: 'card',
    badgeText: 'Pago seguro 256-bit',
  },
  {
    id: 'spei_transferencia',
    name: 'Transferencia Bancaria SPEI',
    description: 'Transfiere directamente a la cuenta CLABE de Lavandería Naty sin comisiones.',
    iconType: 'bank',
    badgeText: 'Confirmación al instante',
  },
  {
    id: 'mercado_pago',
    name: 'Mercado Pago / Billetera QR',
    description: 'Paga escaneando el código QR oficial de Lavandería Naty con tu app favorita.',
    iconType: 'qr',
    badgeText: 'QR Dinámico',
  },
];

export const INITIAL_SAMPLE_ORDERS: Order[] = [
  {
    id: 'NATY-1042',
    customer: {
      name: 'Carlos Mendoza',
      phone: '+52 899 412 9876',
      address: 'Calle Mar Caribe 240',
      neighborhood: 'Col. Ventura, Reynosa',
      reference: 'A 2 cuadras de Playa Paamul, reja negra',
    },
    items: [
      {
        serviceId: 'lavado-secado-canasto',
        name: 'Lavado y Secado de Ropa (Medida Canasto Chico)',
        category: 'ropa_canasto',
        quantity: 2,
        unitPrice: 60,
        unit: 'medida',
      },
      {
        serviceId: 'sabana-pieza',
        name: 'Lavado y Secado de Sábana por Pieza',
        category: 'ropa_cama',
        quantity: 2,
        unitPrice: 30,
        unit: 'pieza',
      },
    ],
    canastosCount: 2,
    extras: {
      extraJabon: 1,
      extraSuavizante: 1,
      extraPinol: 1,
    },
    carePreferences: {
      detergent: 'ecologico',
      fragrance: 'lavanda',
      softener: true,
      specialNotes: 'Prendas de color separadas de las blancas.',
    },
    pickupDate: 'Hoy',
    pickupSlot: '09:00 - 11:00',
    deliveryDate: 'Mañana',
    deliverySlot: '16:00 - 18:00',
    deliveryType: 'estandar',
    paymentMethod: 'efectivo',
    paymentDetails: {
      method: 'efectivo',
      status: 'por_cobrar_en_entrega',
    },
    subtotal: 210, // 2*60=120 + 2*30=60 + 30 extras = 210
    deliveryFee: 0,
    total: 210,
    status: 'lavando',
    createdAt: '2026-10-24T09:15:00Z',
    updatedAt: '2026-10-24T14:30:00Z',
    driver: {
      name: 'Roberto Gómez (Beto)',
      phone: '+52 55 8899 1122',
      vehicle: 'Moto-Furgón Naty #03',
      plate: 'NT-892-CD',
    },
    history: [
      {
        status: 'solicitado',
        timestamp: '09:15 AM',
        note: 'Pedido de 2 medidas de canasto chico y sábanas registrado en la app.',
        updatedBy: 'Sistema Web Naty',
      },
      {
        status: 'recolectando',
        timestamp: '10:05 AM',
        note: 'Repartidor Roberto Gómez recolectó la ropa en el domicilio.',
        updatedBy: 'Roberto Gómez (Repartidor)',
      },
      {
        status: 'en_taller',
        timestamp: '11:20 AM',
        note: 'Medidas verificadas en taller (2 canastos chicos). Agregado extra de jabón, suavizante y Pinol.',
        updatedBy: 'Naty (Taller Principal)',
      },
      {
        status: 'lavando',
        timestamp: '02:30 PM',
        note: 'En lavadora industrial con ciclo suave y aroma Lavanda.',
        updatedBy: 'Naty (Taller Principal)',
      },
    ],
  },
  {
    id: 'NATY-1088',
    customer: {
      name: 'Mariana Silva',
      phone: '+52 55 9912 3344',
      address: 'Calle Jazmines 88, Casa 3',
      neighborhood: 'Residencial Florencia',
      reference: 'Frente al parque infantil, timbre verde',
    },
    items: [
      {
        serviceId: 'cobertor-king-aborregado',
        name: 'Lavado y Secado Cobertor King Size Aborregado',
        category: 'cobertores',
        quantity: 1,
        unitPrice: 150,
        unit: 'pieza',
      },
      {
        serviceId: 'cobertor-matrimonial',
        name: 'Lavado y Secado de Cobertor Matrimonial',
        category: 'cobertores',
        quantity: 1,
        unitPrice: 90,
        unit: 'pieza',
      },
    ],
    canastosCount: 0,
    extras: {
      extraJabon: 0,
      extraSuavizante: 1,
      extraPinol: 0,
    },
    carePreferences: {
      detergent: 'hipoalergenico',
      fragrance: 'fresco_primaveral',
      softener: true,
      specialNotes: 'Cuidar el borrego del cobertor king para que quede suave.',
    },
    pickupDate: 'Ayer',
    pickupSlot: '11:00 - 13:00',
    deliveryDate: 'Hoy',
    deliverySlot: '18:00 - 20:00',
    deliveryType: 'estandar',
    paymentMethod: 'terminal_puerta',
    paymentDetails: {
      method: 'terminal_puerta',
      status: 'por_cobrar_en_entrega',
    },
    subtotal: 250, // 150 + 90 + 10 = 250
    deliveryFee: 0,
    total: 250,
    status: 'en_reparto',
    createdAt: '2026-10-23T11:00:00Z',
    updatedAt: '2026-10-24T18:10:00Z',
    driver: {
      name: 'David Ortiz',
      phone: '+52 55 7766 5544',
      vehicle: 'Camioneta Naty EcoVan',
      plate: 'NT-404-KL',
    },
    history: [
      {
        status: 'solicitado',
        timestamp: 'Ayer 11:00 AM',
        note: 'Pedido de cobertores registrado con pago en terminal.',
        updatedBy: 'Sistema Web Naty',
      },
      {
        status: 'recolectando',
        timestamp: 'Ayer 12:15 PM',
        note: 'Cobertores recolectados por David Ortiz.',
        updatedBy: 'David Ortiz',
      },
      {
        status: 'en_taller',
        timestamp: 'Ayer 01:00 PM',
        note: 'Cobertores ingresados a taller.',
        updatedBy: 'Naty',
      },
      {
        status: 'lavando',
        timestamp: 'Ayer 03:00 PM',
        note: 'Lavado en tambor de gran capacidad.',
        updatedBy: 'Taller Naty',
      },
      {
        status: 'doblado',
        timestamp: 'Hoy 12:00 PM',
        note: 'Cobertores totalmente secos y doblados con funda protectora.',
        updatedBy: 'Taller Naty',
      },
      {
        status: 'en_reparto',
        timestamp: 'Hoy 06:10 PM',
        note: 'David Ortiz en ruta hacia el domicilio.',
        updatedBy: 'David Ortiz (En ruta)',
      },
    ],
  },
  {
    id: 'NATY-1102',
    customer: {
      name: 'Guillermo Arcos',
      phone: '+52 55 3322 1100',
      address: 'Circuito Pintores 15',
      neighborhood: 'Ciudad Satélite',
      reference: 'Portón gris, caseta de vigilancia',
    },
    items: [
      {
        serviceId: 'lavado-secado-canasto',
        name: 'Lavado y Secado de Ropa (Medida Canasto Chico)',
        category: 'ropa_canasto',
        quantity: 3,
        unitPrice: 60,
        unit: 'medida',
      },
      {
        serviceId: 'frazada-pieza',
        name: 'Lavado y Secado de Frazada por Pieza',
        category: 'ropa_cama',
        quantity: 2,
        unitPrice: 50,
        unit: 'pieza',
      },
    ],
    canastosCount: 3,
    extras: {
      extraJabon: 1,
      extraSuavizante: 1,
      extraPinol: 1,
    },
    carePreferences: {
      detergent: 'desmanchador',
      fragrance: 'sin_fragancia',
      softener: true,
      specialNotes: 'Prendas con manchas de pasto en pantalones.',
    },
    pickupDate: 'Hoy',
    pickupSlot: '16:00 - 18:00',
    deliveryDate: 'Mañana',
    deliverySlot: '11:00 - 13:00',
    deliveryType: 'express',
    paymentMethod: 'spei_transferencia',
    paymentDetails: {
      method: 'spei_transferencia',
      status: 'pagado',
      speiClabe: '646180112345678901',
      speiReference: 'NATY-1102',
    },
    subtotal: 310, // 3*60=180 + 2*50=100 + 30 extras = 310
    deliveryFee: 40,
    total: 350,
    status: 'recolectando',
    createdAt: '2026-10-24T15:00:00Z',
    updatedAt: '2026-10-24T16:20:00Z',
    driver: {
      name: 'Roberto Gómez (Beto)',
      phone: '+52 55 8899 1122',
      vehicle: 'Moto-Furgón Naty #03',
      plate: 'NT-892-CD',
    },
    history: [
      {
        status: 'solicitado',
        timestamp: 'Hoy 03:00 PM',
        note: 'Servicio Express solicitado con SPEI confirmado.',
        updatedBy: 'Sistema Web Naty',
      },
      {
        status: 'recolectando',
        timestamp: 'Hoy 04:20 PM',
        note: 'Beto en camino hacia Ciudad Satélite.',
        updatedBy: 'Roberto Gómez',
      },
    ],
  },
];
