import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Button, Card, CardBody, Badge } from '../components/ui';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((_) => setHealthStatus({ status: 'offline', message: 'Connecting to backend...' }));
  }, []);

  const portals = [
    {
      title: 'Customer Experience',
      badge: 'Mobile-First',
      badgeVariant: 'brand' as const,
      role: 'Scan QR & Multi-guest Dining',
      desc: 'Mobile-first ordering interface. Multi-round ordering, collaborative table cart, waiter call, and simulated DineFlow Pay checkout.',
      icon: QrCode,
      path: '/customer',
      accentBg: 'bg-[#fff4ef]',
      accentColor: 'text-[#d96236]',
      iconBg: 'bg-[#d96236]',
    },
    {
      title: 'Owner Console',
      badge: 'Admin Control',
      badgeVariant: 'warning' as const,
      role: 'Complete Restaurant Control',
      desc: 'Top-level administration. Menu & dynamic pricing, tables & QR generation, staff & RBAC, AI operations studio, and revenue analytics.',
      icon: Store,
      path: '/owner',
      accentBg: 'bg-[#fff8e7]',
      accentColor: 'text-[#bf7a13]',
      iconBg: 'bg-[#bf7a13]',
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
      iconBg: 'bg-[#3974b9]',
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
      iconBg: 'bg-[#be4d27]',
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
      iconBg: 'bg-[#23865b]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#211d1a] flex flex-col justify-between selection:bg-[#d96236] selection:text-white font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e9e3dc] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d96236] flex items-center justify-center text-white shadow-md shadow-[#d96236]/25">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-[#211d1a] flex items-center gap-2">
                <span>DineFlow</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#fff4ef] text-[#be4d27] border border-[#ffc9b5] rounded-full font-mono uppercase tracking-wider font-bold">
                  Commercial Suite
                </span>
              </div>
              <p className="text-xs text-[#7b726a]">Smart Restaurant Table & Dining System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
              leftIcon={<Store className="w-3.5 h-3.5" />}
            >
              Staff Login
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/design-system')}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#d89a20]" />}
            >
              Design Tokens
            </Button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] text-xs text-[#49423c] shadow-2xs">
              <Activity className="w-3.5 h-3.5 text-[#23865b] animate-pulse" />
              <span>
                Backend API:{' '}
                <strong className={healthStatus?.status === 'ok' ? 'text-[#23865b]' : 'text-[#bf7a13]'}>
                  {healthStatus?.status === 'ok' ? 'Online & Healthy' : 'Connecting...'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 w-full flex-1">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="brand" size="md" dot className="mb-4">
            Unified Restaurant Technology • Light System
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-[#211d1a] tracking-tight mb-4">
            Hospitality, beautifully in flow.
          </h1>
          <p className="text-[#7b726a] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            One cohesive, high-performance platform connecting guests, floor waitstaff, kitchen stations,
            and restaurant management in real-time synchronization.
          </p>
        </div>

        {/* Roles Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {portals.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                variant="default"
                isHoverable
                onClick={() => navigate(item.path)}
                className="group relative flex flex-col justify-between border-[#e9e3dc] hover:border-[#ffc9b5] transition-all bg-white"
              >
                <CardBody className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center text-white shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#211d1a] group-hover:text-[#d96236] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-[#7b726a] uppercase tracking-wider mb-2 font-mono">
                      {item.role}
                    </p>
                    <p className="text-xs text-[#7b726a] leading-relaxed">{item.desc}</p>
                  </div>
                </CardBody>
                <div className="p-4 bg-[#fbf9f6] border-t border-[#e9e3dc] flex items-center justify-between text-xs font-bold text-[#d96236] group-hover:text-[#be4d27]">
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-[#e9e3dc] pt-10">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#e9e3dc] shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#fff4ef] text-[#d96236] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#211d1a]">Socket.IO Real-Time</h4>
              <p className="text-[11px] text-[#7b726a] mt-0.5">
                Instant bi-directional state sync across floor, kitchen, and customer carts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#e9e3dc] shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#fff8e7] text-[#bf7a13] flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#211d1a]">DineFlow Pay Demo</h4>
              <p className="text-[11px] text-[#7b726a] mt-0.5">
                Simulated checkout experience supporting UPI, Cards, Net Banking, and PDF invoices.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#e9e3dc] shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#e8f6ef] text-[#23865b] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#211d1a]">Gemini AI Assistant</h4>
              <p className="text-[11px] text-[#7b726a] mt-0.5">
                Intelligent operational insights and automated culinary menu description generation.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e9e3dc] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7b726a]">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#d96236]" />
            <span>DineFlow Restaurant Operating System &bull; Version 1.0 Commercial</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#23865b] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#23865b] animate-pulse" />
              All Systems Operational
            </span>
            <span>&copy; {new Date().getFullYear()} DineFlow Technologies</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
