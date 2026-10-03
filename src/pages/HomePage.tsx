import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Utensils,
  Store,
  Layers,
  ChefHat,
  ConciergeBell,
  QrCode,
  ArrowRight,
  Sparkles,
  Activity,
  ShieldCheck,
  Zap,
  TrendingUp,
  Receipt,
  Clock,
  ChevronRight,
  Heart,
  Compass,
} from 'lucide-react';
import { Button, Card, CardBody, Badge } from '../components/ui';
import { TableSelectorModal } from '../components/common/TableSelectorModal';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((_) => setHealthStatus({ status: 'offline', message: 'Connecting to backend...' }));
  }, []);

  const portals = [
    {
      title: 'Customer Experience',
      badge: 'Table Intelligence V2',
      badgeVariant: 'brand' as const,
      role: 'Rasrang Digital Dining',
      desc: 'Mobile-first dining interface for Rasrang. Table Ideas shared wishlist, Taste Journey mood preferences, Help Me Choose discovery, multi-round ordering, and DineSetu Pay checkout.',
      icon: QrCode,
      path: '/customer',
      accentBg: 'bg-[#fff7ed]',
      accentColor: 'text-[#d97706]',
      iconBg: 'bg-gradient-to-br from-[#d97706] to-[#b45309]',
    },
    {
      title: 'Owner Console',
      badge: 'Admin Control',
      badgeVariant: 'warning' as const,
      role: 'Rasrang Operations & Intelligence',
      desc: 'Top-level administration. Configure Dining Moments, Dish Stories, dietary tags, floor tables & QR codes, staff RBAC, and revenue analytics.',
      icon: Store,
      path: '/owner',
      accentBg: 'bg-[#fff8e7]',
      accentColor: 'text-[#bf7a13]',
      iconBg: 'bg-gradient-to-br from-[#f59e0b] to-[#b45309]',
    },
    {
      title: 'Manager Dashboard',
      badge: 'Floor Operations',
      badgeVariant: 'neutral' as const,
      role: 'Live Floor & 86 Menu Control',
      desc: 'Floor oversight. Live table occupancy, active sessions, 86/out-of-stock menu toggles, and service request handling.',
      icon: Layers,
      path: '/manager',
      accentBg: 'bg-[#eaf2fb]',
      accentColor: 'text-[#3974b9]',
      iconBg: 'bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8]',
    },
    {
      title: 'Kitchen Display (KDS)',
      badge: 'High Speed Prep',
      badgeVariant: 'station' as const,
      role: 'Station Routed Tickets',
      desc: 'High-contrast kitchen display. Real-time station filters (Main, Grill, Beverage, Dessert), timers, and prep status transitions.',
      icon: ChefHat,
      path: '/kitchen',
      accentBg: 'bg-[#fdf2f8]',
      accentColor: 'text-[#9d174d]',
      iconBg: 'bg-gradient-to-br from-[#ea580c] to-[#991b1b]',
    },
    {
      title: 'Waiter Service Terminal',
      badge: 'Floor Service',
      badgeVariant: 'success' as const,
      role: 'Ready Food & Guest Requests',
      desc: 'Waiter terminal. Real-time notifications for ready food, mark served, customer water/cutlery/bill assistance.',
      icon: ConciergeBell,
      path: '/waiter',
      accentBg: 'bg-[#e8f6ef]',
      accentColor: 'text-[#23865b]',
      iconBg: 'bg-gradient-to-br from-[#10b981] to-[#047857]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#211d1a] flex flex-col justify-between selection:bg-[#d97706] selection:text-white font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ecd7b7] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d97706] to-[#b45309] flex items-center justify-center text-white shadow-md shadow-[#d97706]/25">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-[#211d1a] flex items-center gap-2">
                <span>DineSetu</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#fef3c7] text-[#92400e] border border-[#fde68a] rounded-full font-mono uppercase tracking-wider font-bold">
                  V2 Platform
                </span>
              </div>
              <p className="text-xs text-[#786c5e]">Connecting every table to a better dining experience.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTableModalOpen(true)}
              leftIcon={<QrCode className="w-3.5 h-3.5 text-[#d97706]" />}
              className="hidden sm:inline-flex border-[#ecd7b7] text-[#78350f] hover:bg-[#fff7ed]"
            >
              Select Table
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
              leftIcon={<Store className="w-3.5 h-3.5" />}
            >
              Staff Login
            </Button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#fbf9f6] border border-[#ecd7b7] text-xs text-[#49423c] shadow-2xs">
              <Activity className="w-3.5 h-3.5 text-[#059669] animate-pulse" />
              <span>
                Backend API:{' '}
                <strong className={healthStatus?.status === 'ok' ? 'text-[#059669]' : 'text-[#d97706]'}>
                  {healthStatus?.status === 'ok' ? 'Online & Healthy' : 'Connecting...'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full flex-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fff7ed] border border-[#fde68a] text-xs font-bold text-[#b45309] mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Rasrang • Modern Indian Dining • Powered by DineSetu</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#211d1a] tracking-tight mb-4 font-serif leading-tight">
            Hospitality, beautifully connected.
          </h1>
          <p className="text-[#786c5e] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            DineSetu elevates every dining table into an intelligent context — connecting guests,
            Table Ideas collaborative wishlist, kitchen stations, and floor staff in real-time harmony.
          </p>

          {/* Quick Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ecd7b7] text-xs text-[#78350f] font-semibold shadow-2xs">
              <Heart className="w-3.5 h-3.5 fill-[#d97706] text-[#d97706]" />
              Shared Table Ideas
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ecd7b7] text-xs text-[#78350f] font-semibold shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-[#d97706]" />
              Help Me Choose Discovery
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ecd7b7] text-xs text-[#78350f] font-semibold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#d97706]" />
              Table Pulse Live Journey
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ecd7b7] text-xs text-[#78350f] font-semibold shadow-2xs">
              <Receipt className="w-3.5 h-3.5 text-[#d97706]" />
              DineSetu Pay & Memory
            </span>
          </div>
        </motion.div>

        {/* Roles Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {portals.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card
                  variant="default"
                  isHoverable
                  onClick={() => {
                    if (item.path === '/customer') {
                      setIsTableModalOpen(true);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className="h-full flex flex-col justify-between border-[#ecd7b7] hover:border-[#d97706] hover:shadow-lg transition-all bg-white cursor-pointer group rounded-2xl overflow-hidden"
                >
                  <CardBody className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant={item.badgeVariant} size="sm">
                        {item.badge}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#211d1a] group-hover:text-[#d97706] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs font-bold text-[#786c5e] uppercase tracking-wider mb-2 font-mono">
                        {item.role}
                      </p>
                      <p className="text-xs text-[#786c5e] leading-relaxed">{item.desc}</p>
                      {item.path === '/customer' && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#b45309] bg-[#fff7ed] px-2.5 py-1 rounded-lg border border-[#fde68a] flex items-center gap-1.5">
                            <QrCode className="w-3.5 h-3.5 text-[#d97706]" />
                            Choose from 7 Live Tables &amp; QR
                          </span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                  <div className="p-4 bg-[#fffdfa] border-t border-[#ecd7b7] flex items-center justify-between text-xs font-bold text-[#b45309] group-hover:text-[#92400e]">
                    <span>{item.path === '/customer' ? 'Choose Table & Dine' : 'Launch Workspace'}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform text-[#d97706]" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Table Selector & QR Dining Modal */}
        <TableSelectorModal
          isOpen={isTableModalOpen}
          onClose={() => setIsTableModalOpen(false)}
        />

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-[#ecd7b7] pt-10">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#ecd7b7] shadow-2xs hover:border-[#d97706] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#fff7ed] text-[#d97706] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#211d1a]">Socket.IO Real-Time Floor</h4>
              <p className="text-[11px] text-[#786c5e] mt-0.5">
                Instant bi-directional state sync across floor, kitchen stations, and customer carts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#ecd7b7] shadow-2xs hover:border-[#d97706] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#fff8e7] text-[#bf7a13] flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#211d1a]">DineSetu Pay &amp; Digital Keepsake</h4>
              <p className="text-[11px] text-[#786c5e] mt-0.5">
                Instant checkout experience with split billing, digital memory keepsake cards, and zero app download.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#ecd7b7] shadow-2xs hover:border-[#d97706] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#e8f6ef] text-[#059669] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#211d1a]">Table Intelligence &amp; AI Discovery</h4>
              <p className="text-[11px] text-[#786c5e] mt-0.5">
                Dynamic dining stage pairings, Taste Journey moods, and Gemini AI culinary insights.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ecd7b7] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#786c5e]">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#d97706]" />
            <span className="font-medium">DineSetu Restaurant Operating System &bull; Version 2.0 Modern Dining</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#059669] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              All Systems Operational
            </span>
            <span>&copy; {new Date().getFullYear()} DineSetu Technologies &bull; Rasrang</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
