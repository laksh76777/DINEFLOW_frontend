import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Upload,
  Image as ImageIcon,
  Check,
  Save,
  Sparkles,
  Palette,
  Clock,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Eye,
  Loader2,
  Building,
  Layers,
  ShieldCheck,
  Percent,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Input,
  Select,
  PageHeader,
} from '../components/ui';
import { restaurantService, RestaurantProfile } from '../services/restaurantService';
import { uploadService } from '../services/uploadService';
import { toast } from '../stores/useToastStore';

const COVER_PRESETS = [
  {
    name: 'Modern Rasrang Dining',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Royal Heritage Degs',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Charcoal Tandoor Grill',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Saffron & Spices Ambience',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1600&q=85',
  },
];

export const RestaurantBrandingPage: React.FC = () => {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Load initial profile
  useEffect(() => {
    restaurantService
      .getProfile()
      .then((data) => setProfile(data))
      .catch((err) => toast.error('Failed to load branding', err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      const updated = await restaurantService.updateProfile(profile);
      setProfile(updated);
      
      // Update local storage cache & notify system
      if (updated.name) {
        localStorage.setItem('dineflow_restaurant_name', updated.name);
        window.dispatchEvent(new Event('storage'));
      }

      toast.success(
        'Settings Saved Successfully',
        'Updated restaurant identity, taxes, and customer mobile experience.'
      );
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Could not save restaurant settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'cover' | 'logo') => {
    if (type === 'cover') setUploadingCover(true);
    if (type === 'logo') setUploadingLogo(true);

    try {
      const res = await uploadService.uploadImage(file, `branding/${type}`);
      if (type === 'cover') {
        setProfile((prev) => (prev ? { ...prev, coverImage: res.url } : null));
        toast.success('Cover Image Uploaded', 'New cover banner synced successfully');
      } else {
        setProfile((prev) => (prev ? { ...prev, logo: res.url } : null));
        toast.success('Logo Uploaded', 'New restaurant logo synced successfully');
      }
    } catch (err: any) {
      toast.error('Upload Error', err.message);
    } finally {
      if (type === 'cover') setUploadingCover(false);
      if (type === 'logo') setUploadingLogo(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-8 h-8 text-[#d96236] animate-spin" />
        <p className="text-sm text-[#7b726a]">Loading restaurant settings & identity console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 text-[#211d1a] font-sans">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={coverInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, 'cover');
        }}
      />
      <input
        type="file"
        ref={logoInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, 'logo');
        }}
      />

      {/* Purpose & Overview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#fff4ef] border border-[#ffc9b5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d96236] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#d96236] mb-0.5">
              OWNER IDENTITY & OPERATIONS SETTINGS
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#211d1a] tracking-tight">
              Master Restaurant Configuration & Live Branding
            </h2>
            <p className="text-xs text-[#7b726a] mt-0.5 max-w-2xl leading-relaxed">
              Configure your establishment identity, tax rates (GSTIN), operating hours, and customer-facing visual theme. Changes apply across guest QR menus, manager terminals, and official tax invoices.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={() => handleSave()}
          isLoading={isSaving}
          className="shrink-0 text-xs font-bold shadow-md shadow-[#d96236]/20"
        >
          Save All Changes
        </Button>
      </div>

      {/* Main Grid: Form on Left, Live Customer Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Imagery: Cover & Logo Upload Cards */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#d96236]" />
                  <span>Atmosphere & Visual Media</span>
                </h3>
                <p className="text-xs text-[#7b726a] mt-0.5">
                  High-definition photography displayed on customer welcome screens and table QR menus.
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Cover Image Upload Area */}
              <div>
                <label className="text-xs font-semibold text-[#4d443c] mb-1.5 block">
                  Restaurant Cover Banner (16:9 ratio recommended)
                </label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="relative h-44 rounded-2xl overflow-hidden border border-[#e9e3dc] hover:border-[#d96236] cursor-pointer group transition-all"
                >
                  <img
                    src={profile.coverImage}
                    alt="Cover Banner"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#211d1a]/50 opacity-0 group-hover:opacity-100 backdrop-blur-xs flex flex-col items-center justify-center text-white transition-opacity gap-2">
                    {uploadingCover ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#d89a20]" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#d89a20]" />
                        <span className="text-xs font-semibold">Click to Replace Cover Image</span>
                      </>
                    )}
                  </div>
                  {uploadingCover && (
                    <div className="absolute inset-0 bg-[#211d1a]/80 flex items-center justify-center text-white gap-2 text-xs">
                      <Loader2 className="w-5 h-5 animate-spin text-[#d96236]" />
                      <span>Uploading image...</span>
                    </div>
                  )}
                </div>

                {/* Preset Themes Selector */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-[#7b726a] block mb-1.5">
                    Quick Ambience Presets:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {COVER_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfile({ ...profile, coverImage: preset.url })}
                        className={`p-2 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 ${
                          profile.coverImage === preset.url
                            ? 'bg-[#fff4ef] border-[#d96236] text-[#be4d27] font-bold shadow-2xs'
                            : 'bg-[#fbf9f6] border-[#e9e3dc] text-[#4d443c] hover:border-[#d96236]'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-7 h-7 rounded-lg object-cover shrink-0"
                        />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo Upload Area */}
              <div className="flex items-center gap-4 pt-2 border-t border-[#e9e3dc]">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#e9e3dc] hover:border-[#d96236] cursor-pointer group shrink-0 bg-white"
                >
                  <img
                    src={profile.logo}
                    alt="Restaurant Logo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#211d1a]/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Upload className="w-4 h-4 text-[#d89a20]" />
                  </div>
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-[#211d1a]/80 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-[#d96236]" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#211d1a]">Brand Logo / Crest</div>
                  <p className="text-[11px] text-[#7b726a]">
                    Rendered on QR customer menus, mobile header, guest bills, and official GST tax receipts.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    isLoading={uploadingLogo}
                    className="text-xs py-1"
                  >
                    Change Logo
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 2. Restaurant Information */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
                <Store className="w-4 h-4 text-[#d96236]" />
                <span>Establishment Details</span>
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Restaurant Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />

              <div>
                <label className="text-xs font-semibold text-[#4d443c] mb-1.5 block">
                  Short Tagline & Culinary Description
                </label>
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white border border-[#e9e3dc] text-[#211d1a] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d96236] focus:ring-2 focus:ring-[#d96236]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
                <Input
                  label="Concierge Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Full Address & Dining Location"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </CardBody>
          </Card>

          {/* 3. Operating Hours & Taxes */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d96236]" />
                <span>Operating Hours & Financial Setup</span>
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Service Opening Time"
                  value={profile.openingTime}
                  onChange={(e) => setProfile({ ...profile, openingTime: e.target.value })}
                  placeholder="e.g. 12:00 PM"
                />
                <Input
                  label="Service Closing Time"
                  value={profile.closingTime}
                  onChange={(e) => setProfile({ ...profile, closingTime: e.target.value })}
                  placeholder="e.g. 11:30 PM"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Currency Symbol"
                  value={profile.currency}
                  onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                />
                <Input
                  label="GST / Tax Rate (%)"
                  type="number"
                  value={profile.taxConfiguration?.taxRate ?? 5}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      taxConfiguration: {
                        ...profile.taxConfiguration,
                        taxRate: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  label="Service Charge (%)"
                  type="number"
                  value={profile.taxConfiguration?.serviceChargeRate ?? 5}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      taxConfiguration: {
                        ...profile.taxConfiguration,
                        serviceChargeRate: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <Input
                label="GSTIN Registration / Tax ID"
                value={profile.taxConfiguration?.gstNumber || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    taxConfiguration: {
                      ...profile.taxConfiguration,
                      gstNumber: e.target.value,
                    },
                  })
                }
              />
            </CardBody>
          </Card>

          {/* 4. Dining Floor Zones Configuration */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#d96236]" />
                <span>Restaurant Floor Zones & Architecture</span>
              </h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-xs text-[#7b726a]">
                Standard dining zones configured across Rasrang for table seating, steward dispatch, and manager floor operations:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { name: 'Main Dining Hall', type: 'Indoor Grand Hall', desc: 'Central dining tables T01, T02, T03, T07' },
                  { name: 'Terrace Garden', type: 'Open-Air Patio', desc: 'Al fresco ambient seating T04' },
                  { name: 'Bar & Lounge', type: 'Craft Cocktail Wing', desc: 'High-top bar & cocktail lounge T05' },
                  { name: 'Private Dining Suite', type: 'VIP Royal Enclave', desc: 'Exclusive banqueting room T06' },
                ].map((zone, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#211d1a] font-bold">{zone.name}</strong>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#e8f6ef] text-[#23865b]">
                        Active Zone
                      </span>
                    </div>
                    <div className="text-[10px] text-[#be4d27] font-semibold">{zone.type}</div>
                    <div className="text-[10px] text-[#7b726a]">{zone.desc}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Live Customer Mobile Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7b726a] uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#d96236]" />
              <span>Live Customer Mobile Preview</span>
            </span>
            <Badge variant="brand" size="sm" dot>
              Real-time Render
            </Badge>
          </div>

          {/* Smartphone Shell Frame */}
          <div className="w-full max-w-sm mx-auto bg-white rounded-[2.5rem] p-3 border-4 border-[#e9e3dc] shadow-xl relative overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="w-28 h-4 bg-[#e9e3dc] rounded-full mx-auto mb-2" />

            {/* Inner Mobile Screen Content */}
            <div className="rounded-[1.8rem] bg-[#fbf9f6] overflow-hidden border border-[#e9e3dc] min-h-[520px] flex flex-col text-[#211d1a]">
              {/* Cover Banner with Gradient Overlay */}
              <div className="relative h-40 w-full overflow-hidden bg-[#211d1a]">
                <img
                  src={profile.coverImage}
                  alt="Live Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a]/80 via-[#211d1a]/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <Badge variant="brand" size="sm" dot>
                    Table 07
                  </Badge>
                </div>
              </div>

              {/* Logo & Identity Box */}
              <div className="p-4 -mt-10 relative z-10 space-y-3">
                <div className="flex items-end gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-white shrink-0">
                    <img src={profile.logo} alt="Live Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#d96236] font-bold bg-[#fff4ef] px-1.5 py-0.5 rounded border border-[#ffc9b5]">
                      {profile.currency} • Modern Indian Dining
                    </span>
                    <h3 className="text-lg font-black text-[#211d1a] font-serif truncate mt-1">
                      {profile.name}
                    </h3>
                  </div>
                </div>

                <p className="text-[11px] text-[#4d443c] leading-relaxed line-clamp-2">
                  {profile.description}
                </p>

                <div className="p-2.5 rounded-xl bg-white border border-[#e9e3dc] text-[10px] text-[#7b726a] space-y-1 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#d97706] shrink-0" />
                    <span>
                      {profile.openingTime} – {profile.closingTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-[#d96236] shrink-0" />
                    <span className="truncate">{profile.address}</span>
                  </div>
                </div>

                {/* Simulated Customer Menu Chips Preview */}
                <div className="pt-2 border-t border-[#e9e3dc]">
                  <div className="text-[10px] font-bold uppercase text-[#7b726a] mb-2">
                    Digital Menu Categories
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
                    <span className="px-2.5 py-1 rounded-full bg-[#d96236] text-white font-bold shrink-0 shadow-xs">
                      All Items
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white text-[#4d443c] border border-[#e9e3dc] shrink-0">
                      Small Plates
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white text-[#4d443c] border border-[#e9e3dc] shrink-0">
                      Curries
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Simulated Dock */}
              <div className="mt-auto p-3 bg-white border-t border-[#e9e3dc] flex items-center justify-between text-[10px]">
                <span className="text-[#059669] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                  Table Session #8291
                </span>
                <span className="font-bold text-[#d96236]">DineSetu Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBrandingPage;
