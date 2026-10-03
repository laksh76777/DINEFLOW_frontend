import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
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

  const roles = [
    {
      title: 'Customer Experience',
      badge: 'Mobile First',
      badgeVariant: 'brand' as const,
      role: 'Scan QR & Multi-guest Dining',
      desc: 'Mobile-first ordering interface. Multi-round ordering, collaborative table cart, waiter call, and simulated DineFlow Pay.',
      icon: QrCode,
      path: '/customer',
      color: 'from-orange-500 to-amber-600',
    },
    {
      title: 'Owner Console',
      badge: 'Single Restaurant Admin',
      badgeVariant: 'warning' as const,
      role: 'Complete Restaurant Control',
      desc: 'Top-level administration. Menu & dynamic pricing, tables & QR generation, staff & RBAC, AI operations studio, and analytics.',
      icon: Store,
      path: '/owner',
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Manager Dashboard',
      badge: 'Floor Operations',
      badgeVariant: 'neutral' as const,
      role: 'Live Floor & 86 Menu Control',
      desc: 'Floor oversight. Live table occupancy, active sessions, 86/out-of-stock menu toggles, and service request handling.',
      icon: Layers,
      path: '/manager',
      color: 'from-sky-500 to-blue-600',
    },
    {
      title: 'Kitchen Display (KDS)',
      badge: 'Fast-paced Prep',
      badgeVariant: 'station' as const,
      role: 'Station Routed Tickets',
      desc: 'High-contrast kitchen display. Real-time station filters (Main, Grill, Beverage, Dessert), timers, and prep status transitions.',
      icon: ChefHat,
      path: '/kitchen',
      color: 'from-amber-600 to-red-600',
    },
    {
      title: 'Waiter Service Terminal',
      badge: 'Floor Service',
      badgeVariant: 'success' as const,
      role: 'Ready Food & Guest Requests',
      desc: 'Waiter terminal. Real-time notifications for ready food, mark served, customer water/cutlery/bill assistance.',
      icon: ConciergeBell,
      path: '/waiter',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Hero Header */}
      <header className="border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-950/50">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>DINEFLOW</span>
                <span className="text-[10px] px-2 py-0.5 bg-orange-500/15 text-orange-400 border border-orange-500/30 rounded-full font-mono uppercase tracking-wider">
                  Phase 1 Foundation
                </span>
              </div>
              <p className="text-xs text-stone-400">Smart Restaurant Table & Dining System</p>
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
              variant="outline"
              size="sm"
              onClick={() => navigate('/design-system')}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            >
              Design System
            </Button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>
                Backend API:{' '}
                <strong className={healthStatus?.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}>
                  {healthStatus?.status === 'ok' ? 'Healthy (v1.0)' : 'Checking...'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 w-full flex-1">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="brand" size="md" dot className="mb-4">
            Commercial Architecture • Single Restaurant Platform
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-serif mb-4">
            Unified Hospitality & Dining Management
          </h1>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Connecting diners, floor staff, kitchen stations, and restaurant management into a synchronized,
            real-time dining workflow.
          </p>
        </div>

        {/* Roles Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {roles.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                variant="default"
                isHoverable
                onClick={() => navigate(item.path)}
                className="group relative flex flex-col justify-between"
              >
                <CardBody className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 font-mono">
                      {item.role}
                    </p>
                    <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
                  </div>
                </CardBody>
                <div className="p-4 bg-stone-950/60 border-t border-stone-800/60 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:text-orange-300">
                  <span>Launch Interface</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}

          {/* Design System Card */}
          <Card
            variant="accent"
            isHoverable
            onClick={() => navigate('/design-system')}
            className="group flex flex-col justify-between"
          >
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <Badge variant="brand" size="sm" dot>
                  Reusable UI
                </Badge>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                  Design System Suite
                </h3>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 font-mono">
                  DineFlow Components
                </p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Interactive showcase of buttons, cards, badges, inputs, selects, modals, toasts, skeletons,
                  and states.
                </p>
              </div>
            </CardBody>
            <div className="p-4 bg-stone-950/60 border-t border-stone-800/60 flex items-center justify-between text-xs font-semibold text-orange-400">
              <span>View Component Library</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950/80 py-6 px-4 text-center text-xs text-stone-400">
        <p>DineFlow Smart Restaurant Table & Dining Management System • Built with React 18, Node.js & Socket.IO</p>
      </footer>
    </div>
  );
};
