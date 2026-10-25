import React, { useState } from 'react';
import { AdminTallerPanel } from './components/AdminTallerPanel';
import { CoverageAndFaq } from './components/CoverageAndFaq';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { NotificationCenter } from './components/NotificationCenter';
import { OrderTracker } from './components/OrderTracker';
import { OrderWizard } from './components/OrderWizard';
import { ServicesCatalog } from './components/ServicesCatalog';
import { ToastBanner } from './components/ToastBanner';
import { getActiveOrderId, setActiveOrderId } from './utils/storage';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'order' | 'track' | 'admin' | 'services'>('home');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(getActiveOrderId());
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>('');

  const handleNavigate = (view: 'home' | 'order' | 'track' | 'admin' | 'services') => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartOrder = (serviceId?: string) => {
    setPreselectedServiceId(serviceId);
    setActiveView('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackOrder = (code: string) => {
    setSelectedOrderId(code);
    setActiveOrderId(code);
    setActiveView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCreated = (newOrderId: string) => {
    setSelectedOrderId(newOrderId);
    setActiveOrderId(newOrderId);
    setActiveView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyPromo = (code: string) => {
    setAppliedPromoCode(code);
    setActiveView('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Real-time Toast Banner */}
      <ToastBanner
        onSelectOrder={handleTrackOrder}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
      />

      {/* Push Notification Drawer / Modal */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onSelectOrder={handleTrackOrder}
        onApplyPromoCode={handleApplyPromo}
      />

      {/* Top Bar Contract Navigation */}
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <Hero
              onStartOrder={() => handleStartOrder()}
              onTrackOrder={handleTrackOrder}
              onExploreServices={() => handleNavigate('services')}
            />
            <ServicesCatalog onSelectServiceToOrder={handleStartOrder} />
            <CoverageAndFaq />
          </>
        )}

        {activeView === 'order' && (
          <OrderWizard
            onOrderCreated={handleOrderCreated}
            onCancel={() => handleNavigate('home')}
            initialPromoCode={appliedPromoCode}
            preselectedServiceId={preselectedServiceId}
          />
        )}

        {activeView === 'track' && (
          <OrderTracker
            initialOrderId={selectedOrderId}
            onNewOrderClick={() => handleStartOrder()}
          />
        )}

        {activeView === 'admin' && (
          <AdminTallerPanel onSelectOrderToTrack={handleTrackOrder} />
        )}

        {activeView === 'services' && (
          <>
            <ServicesCatalog onSelectServiceToOrder={handleStartOrder} />
            <CoverageAndFaq />
          </>
        )}
      </main>

      {/* Unified Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
