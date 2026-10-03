import React, { useState, useEffect } from 'react';
import { Card, CardBody, Badge, Button } from '../components/ui';
import { toast } from '../stores/useToastStore';
import { Sparkles, Users, Bell, ShoppingBag, Clock } from 'lucide-react';
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
      <div className="relative h-44 rounded-2xl overflow-hidden border border-[#e9e3dc] shadow-sm">
        <img
          src={
            profile?.coverImage ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
          }
          alt="Bistro Ambience"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a]/80 via-[#211d1a]/30 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white bg-white shadow-md shrink-0">
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
              <span className="text-[10px] font-mono tracking-widest uppercase text-white bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20">
                {profile?.currency || '₹'} • Contemporary Bistro
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
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
      <Card>
        <CardBody className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fff4ef] border border-[#d96236]/20 text-[#d96236] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#211d1a]">Diners at Table 07</div>
              <div className="text-[11px] text-[#7b726a]">Laksh (Host), Priya, Rahul</div>
            </div>
          </div>
          <Badge variant="brand" size="sm" dot>
            Round 01
          </Badge>
        </CardBody>
      </Card>

      {/* Description & Operating Info */}
      <div className="p-3.5 rounded-xl bg-white border border-[#e9e3dc] text-[11px] text-[#4d443c] space-y-2 shadow-xs">
        <p className="line-clamp-2 leading-relaxed text-[#4d443c]">
          {profile?.description ||
            'Contemporary artisanal dining celebrating regional heritage flavors and crafted spices.'}
        </p>
        <div className="flex items-center justify-between text-[11px] text-[#7b726a] pt-2 border-t border-[#f0ebe4]">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#d89a20]" />
            {profile?.openingTime || '12:00 PM'} – {profile?.closingTime || '11:30 PM'}
          </span>
          <span className="text-[#7b726a]">Taxes: {profile?.taxConfiguration?.taxRate ?? 5}% GST</span>
        </div>
      </div>

      {/* Interactive Foundation Notice */}
      <Card>
        <CardBody className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#d96236]">
            <Sparkles className="w-4 h-4" />
            <span>Connected to Live Restaurant Brand Assets</span>
          </div>
          <p className="text-xs text-[#7b726a] leading-relaxed">
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
