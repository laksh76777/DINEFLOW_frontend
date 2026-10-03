import React, { useState, useEffect } from 'react';
import { Card, CardBody, Badge, Button, EmptyState } from '../components/ui';
import { toast } from '../stores/useToastStore';
import { Sparkles, Utensils, Users, Bell, ShoppingBag, Clock, MapPin } from 'lucide-react';
import { restaurantService, RestaurantProfile } from '../services/restaurantService';

export const CustomerPreview: React.FC = () => {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);

  useEffect(() => {
    restaurantService
      .getProfile()
      .then((data) => setProfile(data))
      .catch((_) => {});
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* Restaurant Cover Banner from Live Branding */}
      <div className="relative h-44 rounded-2xl overflow-hidden border border-stone-800">
        <img
          src={
            profile?.coverImage ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
          }
          alt="Bistro Ambience"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-stone-900 shadow-lg shrink-0">
              <img
                src={
                  profile?.logo ||
                  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'
                }
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-500/30">
                {profile?.currency || '₹'} • Contemporary Bistro
              </span>
              <h2 className="text-base font-bold text-white font-serif mt-0.5">
                {profile?.name || 'Saffron & Sage'}
              </h2>
            </div>
          </div>
          <Badge variant="veg" size="sm">
            Veg Friendly
          </Badge>
        </div>
      </div>

      {/* Session Diners Chip Card */}
      <Card variant="glass">
        <CardBody className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Diners at Table 07</div>
              <div className="text-[11px] text-stone-400">Laksh (Host), Priya, Rahul</div>
            </div>
          </div>
          <Badge variant="brand" size="sm" dot>
            Round 01
          </Badge>
        </CardBody>
      </Card>

      {/* Description & Operating Info */}
      <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-300 space-y-1.5">
        <p className="line-clamp-2 leading-relaxed text-stone-300">
          {profile?.description ||
            'Contemporary artisanal dining celebrating regional heritage flavors and crafted spices.'}
        </p>
        <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800/60">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            {profile?.openingTime || '12:00 PM'} – {profile?.closingTime || '11:30 PM'}
          </span>
          <span className="text-stone-400">Taxes: {profile?.taxConfiguration?.taxRate ?? 5}% GST</span>
        </div>
      </div>

      {/* Interactive Foundation Notice */}
      <Card variant="default">
        <CardBody className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
            <Sparkles className="w-4 h-4" />
            <span>Connected to Live Restaurant Brand Assets</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            DineFlow's mobile shell dynamically reflects the cover photo, emblem, and theme palette
            customized by the restaurant owner in Phase 3.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              leftIcon={<Bell className="w-3.5 h-3.5" />}
              onClick={() => toast.info('Waiter Alerted', 'Water request logged for Table 07')}
            >
              Test Waiter Call
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="flex-1"
              leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
              onClick={() => toast.success('Cart Sync', 'Collaborative cart synchronized')}
            >
              Sync Cart
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
