import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChefHat,
  ConciergeBell,
  Layers,
  Store,
  Check,
} from 'lucide-react';
import { Button, Input, Badge } from '../components/ui';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';
import { Role } from '../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('owner@dineflow.com');
  const [password, setPassword] = useState('dineflow-demo');
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
      title: 'Owner',
      email: 'owner@dineflow.com',
      icon: Store,
      badgeColor: 'border-[#ffc9b5] text-[#be4d27] bg-[#fff4ef]',
    },
    {
      role: 'MANAGER' as Role,
      title: 'Manager',
      email: 'manager@dineflow.com',
      icon: Layers,
      badgeColor: 'border-[#bfdbfe] text-[#3974b9] bg-[#eaf2fb]',
    },
    {
      role: 'KITCHEN' as Role,
      title: 'Kitchen',
      email: 'kitchen@dineflow.com',
      icon: ChefHat,
      badgeColor: 'border-[#fed7aa] text-[#bf7a13] bg-[#fff8e7]',
    },
    {
      role: 'WAITER' as Role,
      title: 'Waiter',
      email: 'waiter@dineflow.com',
      icon: ConciergeBell,
      badgeColor: 'border-[#a5d8be] text-[#23865b] bg-[#e8f6ef]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#211d1a] flex font-sans">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Visual Side (Desktop) */}
        <div className="hidden lg:block relative m-4 rounded-3xl overflow-hidden shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1551530241-1ccbaa7a9a84?auto=format&fit=crop&w=1400&q=85"
            alt="Warm restaurant interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a]/85 via-[#211d1a]/40 to-transparent" />
          
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white text-[#d96236] flex items-center justify-center font-bold shadow-lg">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Dine<span className="text-[#ffedbd]">Flow</span>
              </span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight mb-3 font-serif leading-tight">
              Hospitality, beautifully in flow.
            </h2>
            <p className="text-white/80 text-sm max-w-md leading-relaxed mb-6">
              One elegant platform connecting every table, kitchen ticket, and staff member into harmonious dining rhythm.
            </p>

            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold text-white font-mono">
                SS
              </span>
              <div className="text-xs">
                <strong className="block text-white">Saffron & Sage Bistro</strong>
                <span className="text-white/60">New Delhi • Live Station Node</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center gap-3 lg:hidden mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#d96236] text-white flex items-center justify-center font-bold shadow-md shadow-[#d96236]/25">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-[#211d1a]">
                Dine<span className="text-[#d96236]">Flow</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#d96236] uppercase font-mono">
                STAFF WORKSPACE ACCESS
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#211d1a] tracking-tight mt-1">
                Welcome back
              </h1>
              <p className="text-xs text-[#7b726a] mt-1">
                Sign in to manage tonight's service operations and floor orders.
              </p>
            </div>

            {/* Quick 1-Click Role Logins */}
            <div className="p-4 bg-white border border-[#e9e3dc] rounded-2xl shadow-2xs space-y-2.5">
              <div className="text-[11px] font-bold text-[#49423c] flex items-center justify-between">
                <span>Quick Demo Profiles (1-Click)</span>
                <span className="text-[9px] text-[#7b726a] font-mono">Instant Sign-in</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickProfiles.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => {
                        setEmail(item.email);
                        setPassword('dineflow-demo');
                        performLogin({ email: item.email, password: 'dineflow-demo' });
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-[#e9e3dc] hover:border-[#ffc9b5] bg-[#fbf9f6] hover:bg-[#fff4ef] transition-all text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#e9e3dc] flex items-center justify-center text-[#d96236] shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#211d1a] truncate group-hover:text-[#d96236]">
                          {item.title}
                        </div>
                        <div className="text-[9px] text-[#7b726a] truncate">{item.email.split('@')[0]}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Standard Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-[#fde8e8] border border-[#fca5a5] rounded-xl text-xs font-semibold text-[#c54e4a]">
                  {errorMessage}
                </div>
              )}

              <Input
                label="Staff Email Address"
                type="email"
                placeholder="e.g. owner@dineflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Security Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to DineFlow
              </Button>
            </form>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#7b726a] pt-2">
              <ShieldCheck className="w-4 h-4 text-[#23865b]" />
              <span>Protected by DineFlow Role-Aware Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
