import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Droplets,
  Home,
  Info,
  MapPin,
  Minus,
  Phone,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  User,
  Wind,
} from 'lucide-react';
import { APP_LOGO_SRC, PAYMENT_METHODS_DATA, SERVICES_CATALOG, SERVICE_EXTRAS } from '../data/mockData';
import { CarePreferences, Order, OrderExtras, OrderItem, PaymentMethodType, ServiceItem } from '../types';
import { notifyAppointmentReminder } from '../utils/notifications';
import { createNewOrder } from '../utils/storage';

interface OrderWizardProps {
  onOrderCreated: (orderId: string) => void;
  onCancel: () => void;
  initialPromoCode?: string;
  preselectedServiceId?: string;
}

export const OrderWizard: React.FC<OrderWizardProps> = ({
  onOrderCreated,
  onCancel,
  initialPromoCode = '',
  preselectedServiceId,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Cart Items
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    if (preselectedServiceId) {
      const s = SERVICES_CATALOG.find((serv) => serv.id === preselectedServiceId);
      if (s) {
        return [
          {
            serviceId: s.id,
            name: s.name,
            category: s.category,
            quantity: 1,
            unitPrice: s.price,
            unit: s.unit,
          },
        ];
      }
    }
    // Default initial item: 1 medida canasto chico de lavado y secado
    const defaultService = SERVICES_CATALOG[0];
    return [
      {
        serviceId: defaultService.id,
        name: defaultService.name,
        category: defaultService.category,
        quantity: 1,
        unitPrice: defaultService.price,
        unit: defaultService.unit,
      },
    ];
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('todos');

  // Extras ($10 pesos c/u)
  const [extras, setExtras] = useState<OrderExtras>({
    extraJabon: 0,
    extraSuavizante: 0,
    extraPinol: 0,
  });

  // Step 2: Custom Care
  const [carePreferences, setCarePreferences] = useState<CarePreferences>({
    detergent: 'ecologico',
    fragrance: 'lavanda',
    softener: true,
    specialNotes: '',
  });

  // Step 3: Address & Schedule
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    neighborhood: '',
    reference: '',
  });

  const [pickupDate, setPickupDate] = useState('Hoy');
  const [pickupSlot, setPickupSlot] = useState('09:00 - 12:00');
  const [deliveryDate, setDeliveryDate] = useState('Mañana');
  const [deliverySlot, setDeliverySlot] = useState('16:00 - 19:00');
  const [deliveryType, setDeliveryType] = useState<'estandar' | 'express'>('estandar');
  const [enableAppointmentReminder, setEnableAppointmentReminder] = useState(true);

  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('efectivo');
  const [cashBillAmount, setCashBillAmount] = useState('200');
  const [cardFormData, setCardFormData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [tipAmount, setTipAmount] = useState<number>(15);
  const [promoCode, setPromoCode] = useState(initialPromoCode);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(initialPromoCode ? initialPromoCode : null);
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart helpers
  const handleAddItem = (service: ServiceItem) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.serviceId === service.id);
      if (exists) {
        return prev.map((i) =>
          i.serviceId === service.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          serviceId: service.id,
          name: service.name,
          category: service.category,
          quantity: 1,
          unitPrice: service.price,
          unit: service.unit,
        },
      ];
    });
  };

  const handleUpdateQuantity = (serviceId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.serviceId === serviceId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveItem = (serviceId: string) => {
    setCartItems((prev) => prev.filter((i) => i.serviceId !== serviceId));
  };

  const handleUpdateExtra = (key: keyof OrderExtras, delta: number) => {
    setExtras((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };

  // Calculations
  const itemsSubtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const extrasSubtotal = (extras.extraJabon + extras.extraSuavizante + extras.extraPinol) * 10;
  const subtotal = itemsSubtotal + extrasSubtotal;

  const deliveryFee = subtotal >= 200 ? 0 : 35;
  const expressFee = deliveryType === 'express' ? 40 : 0;

  let discountAmount = 0;
  if (appliedPromo?.toUpperCase() === 'NATYFRESH') {
    discountAmount = Math.round(subtotal * 0.2); // 20% off
  } else if (appliedPromo?.toUpperCase() === 'PRIMERAVEZ') {
    discountAmount = Math.min(50, subtotal);
  } else if (appliedPromo?.toUpperCase() === 'MARTES25') {
    discountAmount = Math.round(subtotal * 0.25);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee + expressFee + tipAmount);

  const applyPromoHandler = () => {
    const clean = promoCode.trim().toUpperCase();
    if (['NATYFRESH', 'PRIMERAVEZ', 'MARTES25'].includes(clean)) {
      setAppliedPromo(clean);
      setFormErrors((prev) => ({ ...prev, promo: '' }));
    } else {
      setFormErrors((prev) => ({ ...prev, promo: 'Código no válido o expirado.' }));
    }
  };

  // Validation
  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!customer.name.trim()) errors.name = 'Por favor ingresa tu nombre completo.';
    if (!customer.phone.trim() || customer.phone.trim().length < 8)
      errors.phone = 'Ingresa un teléfono válido para confirmar la recolección.';
    if (!customer.address.trim()) errors.address = 'Ingresa tu calle y número.';
    if (!customer.neighborhood.trim()) errors.neighborhood = 'Ingresa tu colonia o zona.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = () => {
    const errors: Record<string, string> = {};
    if (paymentMethod === 'tarjeta_en_linea') {
      if (cardFormData.number.replace(/\s/g, '').length < 15) {
        errors.cardNumber = 'Ingresa un número de tarjeta válido (16 dígitos).';
      }
      if (!cardFormData.expiry.includes('/')) {
        errors.cardExpiry = 'Ingresa MM/AA.';
      }
      if (cardFormData.cvv.length < 3) {
        errors.cardCvv = 'CVV de 3 o 4 dígitos.';
      }
      if (!cardFormData.name.trim()) {
        errors.cardName = 'Ingresa el nombre del titular.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (cartItems.length === 0) {
        alert('Por favor agrega al menos un servicio a tu pedido.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4);
      }
    }
  };

  const handleSubmitOrder = () => {
    if (!validateStep4()) return;

    setIsSubmitting(true);

    const canastoItems = cartItems.filter((i) => i.category === 'ropa_canasto');
    const canastosCount = canastoItems.reduce((acc, i) => acc + i.quantity, 0);

    const newOrder = createNewOrder({
      customer,
      items: cartItems,
      canastosCount,
      extras,
      carePreferences,
      pickupDate,
      pickupSlot,
      deliveryDate,
      deliverySlot,
      deliveryType,
      paymentMethod,
      paymentDetails: {
        method: paymentMethod,
        status: paymentMethod === 'tarjeta_en_linea' || paymentMethod === 'spei_transferencia' ? 'pagado' : 'por_cobrar_en_entrega',
        cardLast4: paymentMethod === 'tarjeta_en_linea' ? cardFormData.number.slice(-4) || '4242' : undefined,
        cardBrand: 'Visa / MC',
        speiClabe: '646180112345678901',
        speiReference: `NATY-${Math.floor(1000 + Math.random() * 9000)}`,
        tipAmount,
        discountCode: appliedPromo || undefined,
        discountAmount,
      },
      subtotal,
      deliveryFee: deliveryFee + expressFee,
      total: finalTotal,
    });

    if (enableAppointmentReminder) {
      notifyAppointmentReminder(newOrder.id, 'pickup', `${pickupDate} (${pickupSlot})`);
    }

    setIsSubmitting(false);
    onOrderCreated(newOrder.id);
  };

  const handleCopyClabe = () => {
    navigator.clipboard?.writeText('646180112345678901');
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Wizard Header / Brand Banner */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </button>

          <div className="flex items-center gap-2">
            <img
              src={APP_LOGO_SRC}
              alt="Lavandería Naty"
              className="w-7 h-7 rounded-full object-cover border border-sky-200"
            />
            <span className="text-xs font-bold text-slate-800">Lavandería Naty</span>
          </div>

          <div className="text-xs text-slate-500">
            <span>Paso {currentStep} de 4</span>
          </div>
        </div>

        {/* Step Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, label: '1. Servicios & Extras' },
            { step: 2, label: '2. Cuidado' },
            { step: 3, label: '3. Recolección' },
            { step: 4, label: '4. Pago' },
          ].map((s) => (
            <div
              key={s.step}
              className={`h-2 rounded-full transition-all ${
                s.step < currentStep
                  ? 'bg-sky-600'
                  : s.step === currentStep
                  ? 'bg-sky-500 ring-2 ring-sky-200'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Step Workspace */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          {/* STEP 1: Servicios y Extras */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Selecciona los servicios para tu pedido</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Lavado y secado por medida de canasto chico ($60), puro lavado o secado ($40), cobertores y sábanas.
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                {[
                  { id: 'todos', label: 'Todos los servicios' },
                  { id: 'ropa_canasto', label: 'Ropa (Canasto Chico)' },
                  { id: 'cobertores', label: 'Cobertores' },
                  { id: 'ropa_cama', label: 'Sábanas & Frazadas' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      activeCategoryFilter === cat.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Services List */}
              <div className="space-y-3 mb-8">
                {SERVICES_CATALOG.filter(
                  (s) => activeCategoryFilter === 'todos' || s.category === activeCategoryFilter
                ).map((service) => {
                  const cartItem = cartItems.find((i) => i.serviceId === service.id);
                  const qty = cartItem ? cartItem.quantity : 0;

                  return (
                    <div
                      key={service.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        qty > 0 ? 'border-sky-300 bg-sky-50/30' : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{service.name}</h4>
                          {service.popular && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              Más pedido
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{service.description}</p>
                        <div className="mt-2 text-xs text-slate-700 font-semibold tabular-nums">
                          ${service.price} <span className="font-normal text-slate-500">/ {service.unit}</span>
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        {qty > 0 ? (
                          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(service.id, -1)}
                              className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                              aria-label="Restar uno"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-slate-900 tabular-nums">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(service.id, 1)}
                              className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                              aria-label="Sumar uno"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddItem(service)}
                            className="px-3.5 py-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold rounded-lg hover:bg-sky-600 hover:text-white transition-colors flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* EXTRAS SECTION ($10 c/u) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-sky-50/40 to-slate-50 border border-emerald-200/80 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Extras para tu Lavado ($10 pesos cada uno)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Añade dosis adicionales según tus necesidades de limpieza o fragancia.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Extra Jabón */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Extra de Jabón</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">+$10 c/dosis</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateExtra('extraJabon', -1)}
                        disabled={extras.extraJabon === 0}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">
                        {extras.extraJabon}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateExtra('extraJabon', 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Extra Suavizante */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Extra de Suavizante</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">+$10 c/dosis</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateExtra('extraSuavizante', -1)}
                        disabled={extras.extraSuavizante === 0}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">
                        {extras.extraSuavizante}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateExtra('extraSuavizante', 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Extra Pinol */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Extra de Pinol</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">+$10 c/dosis</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateExtra('extraPinol', -1)}
                        disabled={extras.extraPinol === 0}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">
                        {extras.extraPinol}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateExtra('extraPinol', 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">¿Qué es la medida de Canasto Chico?</span>
                  <p className="mt-0.5 text-slate-500">
                    Es el canasto estándar de lavandería de uso diario. Nuestro recolector verificará tus canastos al
                    recoger tu ropa para darte la mayor transparencia y cuidado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Cuidado Personalizado */}
          {currentStep === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Personaliza el cuidado de tus prendas</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  En Lavandería Naty tratamos cada carga con cariño individual. Elige tu fragancia y tipo de detergente.
                </p>
              </div>

              <div className="space-y-6">
                {/* Detergente */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                    1. Tipo de Detergente Base
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 'ecologico',
                        title: 'Ecológico Cítrico (Recomendado)',
                        desc: 'Biodegradable, fórmula activa que cuida colores y tejidos.',
                      },
                      {
                        id: 'hipoalergenico',
                        title: 'Hipoalergénico Neutro',
                        desc: 'Ideal para piel sensible o ropa de bebés.',
                      },
                      {
                        id: 'aroma_intenso',
                        title: 'Aroma Intenso',
                        desc: 'Fragancia fresca de mayor fijación.',
                      },
                      {
                        id: 'desmanchador',
                        title: 'Oxígeno Activo',
                        desc: 'Poder desmanchante suave sin dañar prendas de color.',
                      },
                    ].map((det) => (
                      <button
                        key={det.id}
                        type="button"
                        onClick={() =>
                          setCarePreferences({ ...carePreferences, detergent: det.id as CarePreferences['detergent'] })
                        }
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          carePreferences.detergent === det.id
                            ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{det.title}</span>
                          {carePreferences.detergent === det.id && (
                            <Check className="w-4 h-4 text-sky-600" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-snug">{det.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fragancia */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                    2. Aroma de Suavizante
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'lavanda', name: 'Lavanda Francesa', icon: '🪻' },
                      { id: 'fresco_primaveral', name: 'Brisa Marina', icon: '🌊' },
                      { id: 'bebe', name: 'Algodón Puro', icon: '☁️' },
                      { id: 'sin_fragancia', name: 'Sin Fragancia', icon: '🌿' },
                    ].map((frag) => (
                      <button
                        key={frag.id}
                        type="button"
                        onClick={() =>
                          setCarePreferences({ ...carePreferences, fragrance: frag.id as CarePreferences['fragrance'] })
                        }
                        className={`p-3 rounded-xl border text-center transition-all ${
                          carePreferences.fragrance === frag.id
                            ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500 font-bold text-sky-950'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="text-xl mb-1">{frag.icon}</div>
                        <div className="text-xs leading-snug">{frag.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas especiales */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    3. Instrucciones o Cuidados Especiales (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={carePreferences.specialNotes}
                    onChange={(e) => setCarePreferences({ ...carePreferences, specialNotes: e.target.value })}
                    placeholder="Ej. Cuidado con cobertor matrimonial, separar sábanas blancas..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Domicilio & Cita */}
          {currentStep === 3 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Dirección y horarios de recolección</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Dinos a dónde acudir para recolectar tus canastos y cuándo te queda mejor recibir tu ropa limpia.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        placeholder="Ej. Roberto Morales"
                        className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {formErrors.name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teléfono Móvil (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        placeholder="Ej. 55 1234 5678"
                        className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          formErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {formErrors.phone && <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Calle y Número *</label>
                    <div className="relative">
                      <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        placeholder="Ej. Av. Central 120, Casa 4"
                        className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          formErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {formErrors.address && <p className="text-[11px] text-rose-600 mt-1">{formErrors.address}</p>}
                  </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Colonia / Zona (Reynosa) *</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={customer.neighborhood}
                          onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })}
                          placeholder="Ej. Col. Ventura / Las Fuentes"
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                            formErrors.neighborhood ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                          }`}
                        />
                      </div>
                      {formErrors.neighborhood && (
                        <p className="text-[11px] text-rose-600 mt-1">{formErrors.neighborhood}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Referencias de entrega (Opcional)</label>
                    <input
                      type="text"
                      value={customer.reference}
                      onChange={(e) => setCustomer({ ...customer, reference: e.target.value })}
                      placeholder="Ej. Casa verde, cerca de Playa Paamul, tocar timbre"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                {/* Scheduling */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                    Horario de Recolección en tu Domicilio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Día de recolección:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['Hoy', 'Mañana', 'Pasado mañana'].map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setPickupDate(day)}
                            className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                              pickupDate === day
                                ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Franja horaria:</span>
                      <select
                        value={pickupSlot}
                        onChange={(e) => setPickupSlot(e.target.value)}
                        className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="09:00 - 12:00">09:00 - 12:00 (Mañana)</option>
                        <option value="12:00 - 15:00">12:00 - 15:00 (Mediodía)</option>
                        <option value="15:00 - 18:00">15:00 - 18:00 (Tarde)</option>
                        <option value="18:00 - 20:30">18:00 - 20:30 (Noche)</option>
                      </select>
                    </div>
                  </div>

                  {/* Delivery speed selector */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="block text-xs font-bold text-slate-900 mb-2">Modalidad de Entrega</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('estandar')}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          deliveryType === 'estandar'
                            ? 'border-sky-500 bg-white ring-1 ring-sky-500'
                            : 'border-slate-200 bg-white/60 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Estándar 24 Horas</span>
                          <span className="text-xs font-medium text-emerald-700">Incluido</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Entrega al día siguiente de la recolección.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType('express')}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          deliveryType === 'express'
                            ? 'border-sky-500 bg-white ring-1 ring-sky-500'
                            : 'border-slate-200 bg-white/60 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Express Mismo Día</span>
                          <span className="text-xs font-bold text-sky-700">+$40</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Listo en 6 a 10 horas hábiles (prioritario).</p>
                      </button>
                    </div>
                  </div>

                  {/* Appointment Push Reminder Toggle */}
                  <label className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-sky-50/70 border border-sky-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAppointmentReminder}
                      onChange={(e) => setEnableAppointmentReminder(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-sky-950">
                        Recordatorio de cita por Notificación Push
                      </span>
                      <p className="text-sky-700 text-[11px] mt-0.5">
                        Te enviaremos una alerta 1 hora antes de que el recolector llegue a tu dirección.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Formas de Pago y Confirmación */}
          {currentStep === 4 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Selecciona tu Forma de Pago</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Aceptamos efectivo, terminal móvil en tu puerta con tarjeta, pago en línea o SPEI.
                </p>
              </div>

              {/* Payment Methods Grid */}
              <div className="space-y-3 mb-6">
                {PAYMENT_METHODS_DATA.map((pm) => (
                  <label
                    key={pm.id}
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'border-sky-500 bg-sky-50/40 ring-1 ring-sky-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value={pm.id}
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="w-4 h-4 text-sky-600 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900">{pm.name}</span>
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {pm.badgeText}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{pm.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Conditional Payment Details Fields */}
              {paymentMethod === 'efectivo' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Pago en efectivo contra entrega</span>
                  </div>
                  <p className="text-slate-500 mb-3">
                    Pagarás al repartidor ${finalTotal} cuando tus prendas sean entregadas limpias.
                  </p>
                  <label className="block text-slate-700 font-medium mb-1">
                    ¿Con qué denominación vas a pagar? (Para llevarte cambio exacto):
                  </label>
                  <div className="flex items-center gap-2 max-w-xs">
                    <span className="text-slate-500">$</span>
                    <input
                      type="number"
                      value={cashBillAmount}
                      onChange={(e) => setCashBillAmount(e.target.value)}
                      placeholder="200"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'terminal_puerta' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span>Terminal móvil en tu puerta</span>
                  </div>
                  <p className="text-slate-500">
                    El repartidor llevará terminal Clip certificada. Puedes pagar con tarjeta física, chip, o con tu
                    celular (Apple Pay / Google Wallet). No se requiere introducir datos ahora.
                  </p>
                </div>
              )}

              {paymentMethod === 'tarjeta_en_linea' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      Datos de Tarjeta (Simulado Seguro)
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Cifrado 256-bit</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Número de Tarjeta</label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardFormData.number}
                      onChange={(e) => setCardFormData({ ...cardFormData, number: e.target.value })}
                      placeholder="4152 3456 7890 1234"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
                    />
                    {formErrors.cardNumber && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1">Vencimiento (MM/AA)</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardFormData.expiry}
                        onChange={(e) => setCardFormData({ ...cardFormData, expiry: e.target.value })}
                        placeholder="11/28"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
                      />
                      {formErrors.cardExpiry && (
                        <p className="text-[11px] text-rose-600 mt-1">{formErrors.cardExpiry}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardFormData.cvv}
                        onChange={(e) => setCardFormData({ ...cardFormData, cvv: e.target.value })}
                        placeholder="•••"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
                      />
                      {formErrors.cardCvv && (
                        <p className="text-[11px] text-rose-600 mt-1">{formErrors.cardCvv}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Nombre en la Tarjeta</label>
                    <input
                      type="text"
                      value={cardFormData.name}
                      onChange={(e) => setCardFormData({ ...cardFormData, name: e.target.value })}
                      placeholder="Como aparece en el plástico"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                    />
                    {formErrors.cardName && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.cardName}</p>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'spei_transferencia' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Datos para Transferencia SPEI Lavandería Naty
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Banco Receptor:</span>
                      <span className="font-bold text-slate-800">BBVA México</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiaria:</span>
                      <span className="font-bold text-slate-800">Lavandería Naty</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-slate-500">CLABE:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-800">646180112345678901</span>
                        <button
                          type="button"
                          onClick={handleCopyClabe}
                          className="p-1 rounded text-slate-500 hover:text-sky-700"
                          title="Copiar CLABE"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {copiedClabe && (
                    <span className="text-[11px] text-emerald-600 font-semibold block">
                      ¡CLABE copiada al portapapeles!
                    </span>
                  )}
                </div>
              )}

              {paymentMethod === 'mercado_pago' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs flex items-center gap-4">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                    <QrCode className="w-10 h-10 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">QR Oficial Lavandería Naty</h4>
                    <p className="text-slate-500 mt-0.5">
                      Podrás escanear el QR desde la app de Mercado Pago o tu banco al momento de la entrega.
                    </p>
                  </div>
                </div>
              )}

              {/* Optional Driver Tip */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Propina voluntaria para el recolector</span>
                  <span className="text-xs text-slate-500">100% para el chofer</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 15, 25, 50].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setTipAmount(amount)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                        tipAmount === amount
                          ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {amount === 0 ? 'Sin propina' : `$${amount}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Wizard Step Navigation Footer */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-slate-500 text-xs font-medium hover:text-slate-800"
              >
                Cancelar
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Continuar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitOrder}
                className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Pedido (${finalTotal})</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary Drawer */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl border border-slate-200 p-5 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Resumen de tu Pedido</h3>
            <span className="text-xs text-slate-500 tabular-nums">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} servicios
            </span>
          </div>

          {/* Items breakdown */}
          <div className="py-4 space-y-3 max-h-64 overflow-y-auto">
            {cartItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Tu carrito está vacío.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.serviceId} className="flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <div className="text-[11px] text-slate-500">
                      {item.quantity} {item.unit} x ${item.unitPrice}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 tabular-nums">
                      ${item.quantity * item.unitPrice}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.serviceId)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Extras in cart summary */}
            {extras.extraJabon > 0 && (
              <div className="flex justify-between text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg">
                <span>Extra de Jabón ({extras.extraJabon})</span>
                <span className="font-bold tabular-nums">+${extras.extraJabon * 10}</span>
              </div>
            )}
            {extras.extraSuavizante > 0 && (
              <div className="flex justify-between text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg">
                <span>Extra de Suavizante ({extras.extraSuavizante})</span>
                <span className="font-bold tabular-nums">+${extras.extraSuavizante * 10}</span>
              </div>
            )}
            {extras.extraPinol > 0 && (
              <div className="flex justify-between text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg">
                <span>Extra de Pinol ({extras.extraPinol})</span>
                <span className="font-bold tabular-nums">+${extras.extraPinol * 10}</span>
              </div>
            )}
          </div>

          {/* Coupon Code input */}
          <div className="pt-3 border-t border-slate-200">
            <span className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cupón de Descuento
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Ej. NATYFRESH"
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono uppercase"
              />
              <button
                type="button"
                onClick={applyPromoHandler}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Aplicar
              </button>
            </div>
            {appliedPromo && (
              <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                <span>Cupón {appliedPromo} aplicado</span>
                <span>-${discountAmount}</span>
              </div>
            )}
            {formErrors.promo && (
              <span className="text-[11px] text-rose-600 block mt-1">{formErrors.promo}</span>
            )}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal servicios:</span>
              <span className="tabular-nums font-medium">${itemsSubtotal}</span>
            </div>

            {extrasSubtotal > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Subtotal extras:</span>
                <span className="tabular-nums">+${extrasSubtotal}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Descuento aplicado:</span>
                <span className="tabular-nums">-${discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Recolección y entrega a domicilio:</span>
              <span className="tabular-nums font-medium">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-semibold">GRATIS</span>
                ) : (
                  `$${deliveryFee}`
                )}
              </span>
            </div>

            {expressFee > 0 && (
              <div className="flex justify-between text-sky-700 font-medium">
                <span>Suplemento Express:</span>
                <span className="tabular-nums">+${expressFee}</span>
              </div>
            )}

            {tipAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Propina recolector:</span>
                <span className="tabular-nums font-medium">+${tipAmount}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
              <span>Total a pagar:</span>
              <span className="tabular-nums text-sky-900">${finalTotal}</span>
            </div>
          </div>

          {/* Trust points */}
          <div className="mt-5 p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Garantía Lavandería Naty</span>
            </div>
            <p>
              Prendas separadas por color, secado completo y doblado higiénico con empaque protector.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
