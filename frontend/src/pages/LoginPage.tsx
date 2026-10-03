import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  UserCheck,
  ChefHat,
  ConciergeBell,
  Layers,
  Store,
} from 'lucide-react';
import { Button, Input, Card, CardBody, Badge } from '../components/ui';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';
import { Role } from '../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Extract redirect url if available
  const fromLocation = (location.state as any)?.from?.pathname;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your staff email address');
      return;
    }
    await performLogin({ email, password });
  };

  const performLogin = async (payload: { email?: string; role?: Role; password?: string }) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      login(data.token, data.user);
      toast.success('Welcome back!', `Signed in as ${data.user.name} (${data.user.role})`);

      // Route to destination or role-specific dashboard
      if (fromLocation && fromLocation !== '/login') {
        navigate(fromLocation, { replace: true });
      } else {
        const roleRoutes: Record<Role, string> = {
          OWNER: '/owner',
          MANAGER: '/manager',
          KITCHEN: '/kitchen',
          WAITER: '/waiter',
        };
        navigate(roleRoutes[data.user.role as Role] || '/', { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
      toast.error('Authentication Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click test profiles
  const quickProfiles = [
    {
      role: 'OWNER' as Role,
      title: 'Restaurant Owner',
      email: 'owner@dineflow.com',
      icon: Store,
      badgeColor: 'border-orange-500/40 text-orange-400 bg-orange-950/40',
    },
    {
      role: 'MANAGER' as Role,
      title: 'Floor Manager',
      email: 'manager@dineflow.com',
      icon: Layers,
      badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-950/40',
    },
    {
      role: 'KITCHEN' as Role,
      title: 'Kitchen Staff',
      email: 'kitchen@dineflow.com',
      icon: ChefHat,
      badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/40',
    },
    {
      role: 'WAITER' as Role,
      title: 'Service Waiter',
      email: 'waiter@dineflow.com',
      icon: ConciergeBell,
      badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-stone-100 flex items-center justify-center p-4 overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Restaurant Atmosphere Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=85"
          alt="Restaurant Ambience"
          className="w-full h-full object-cover object-center filter blur-[2px] scale-105 transform transition-transform duration-1000"
        />
        {/* Dark Warm Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-[#0c0a09]/85 to-stone-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-950/20 via-stone-950/60 to-black/90" />
      </div>

      {/* Main Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md my-8"
      >
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-2xl">
          {/* Animated DineFlow Brand Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 items-center justify-center text-white shadow-xl shadow-orange-950/60 mb-4 ring-4 ring-orange-500/20 relative"
            >
              <UtensilsCrossed className="w-8 h-8 drop-shadow-md" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-stone-900 animate-pulse" />
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
              DINEFLOW
            </h1>
            <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-mono">
              Staff & Management Portal
            </p>
          </div>

          {/* Error Message Alert */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 shadow-lg"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Staff Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. owner@dineflow.com"
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <Input
              label="Password / Access PIN"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Terminal
            </Button>
          </form>

          {/* 1-Click Role Switcher Demo */}
          <div className="mt-6 pt-5 border-t border-stone-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Role Switcher</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Phase 2 Verified</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickProfiles.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => {
                      setEmail(p.email);
                      setPassword('dineflow123');
                      performLogin({ email: p.email, password: 'dineflow123' });
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800/90 border border-stone-800 text-left transition-all hover:border-orange-500/30 group"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${p.badgeColor}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-orange-300 truncate">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate">{p.email}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Test Inactive Account Button */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setEmail('inactive@dineflow.com');
                  setPassword('dineflow123');
                  performLogin({ email: 'inactive@dineflow.com', password: 'dineflow123' });
                }}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Test Deactivated Account Handling (403 Test)</span>
              </button>
            </div>
          </div>

          {/* Guest Table QR Shortcut */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/customer')}
              className="text-xs text-stone-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Switch to Customer QR Mobile Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
