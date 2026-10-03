import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Utensils,
  Search,
  Users,
  Bell,
  ShoppingBag,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  QrCode,
  DollarSign,
  ArrowRight,
  Flame,
  ShieldCheck,
  X,
  Send,
  Droplet,
  Coffee,
  HelpCircle,
  Receipt,
  Download,
  Check,
  ChefHat,
  Leaf,
  Info,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Input,
  Modal,
  EmptyState,
} from '../components/ui';
import { menuService, MenuItem, Category } from '../services/menuService';
import { restaurantService, RestaurantProfile } from '../services/restaurantService';
import { orderService, IOrder } from '../services/orderService';
import { staffRequestService } from '../services/staffRequestService';
import { paymentService, BillSummary, SplitMode, DemoPaymentMethod } from '../services/paymentService';
import { analyticsService } from '../services/analyticsService';
import { socketService } from '../services/socketService';
import { useCartStore, CartItem } from '../stores/useCartStore';
import { toast } from '../stores/useToastStore';
import { soundManager } from '../utils/sound';

export const CustomerMenuPage: React.FC = () => {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'bill'>('menu');

  // Restaurant & Session Context
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('07');
  const [sessionNumber, setSessionNumber] = useState<string>('8291');
  const [myMemberId, setMyMemberId] = useState<string>('guest-1');
  const [myDisplayName, setMyDisplayName] = useState<string>('Laksh');
  const [companions, setCompanions] = useState<Array<{ memberId: string; name: string }>>([
    { memberId: 'guest-1', name: 'Laksh (Host)' },
    { memberId: 'guest-2', name: 'Priya' },
    { memberId: 'guest-3', name: 'Rahul' },
  ]);

  // Menu Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG' | 'FEATURED'>('ALL');
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuLoadError, setMenuLoadError] = useState<string | null>(null);

  // Cart & Ordering
  const {
    items: cartItems,
    addItem,
    removeItem,
    updateQuantity,
    updateItemNotes,
    clearCart,
    getTotalCount,
    getSubtotal,
  } = useCartStore();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [cartBadgeBump, setCartBadgeBump] = useState(false);

  // Customization & Food Detail Modal
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [attributedMember, setAttributedMember] = useState<{ id: string; name: string }>({
    id: myMemberId,
    name: myDisplayName,
  });

  // Placed Orders & Live Tracking
  const [sessionOrders, setSessionOrders] = useState<IOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Confirmation Celebration Modal
  const [orderConfirmation, setOrderConfirmation] = useState<{
    roundNumber: number;
    itemCount: number;
  } | null>(null);

  // Service Request Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState<string>('Water');
  const [serviceNotes, setServiceNotes] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Bill & DineFlow Pay (Phase 12 & Phase 13)
  const [billData, setBillData] = useState<BillSummary | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>('FULL');
  const [splitCount, setSplitCount] = useState<number>(2);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  
  // DineFlow Pay Demo Modal state (strictly simulated, no external provider)
  const [isDineFlowPayOpen, setIsDineFlowPayOpen] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState<DemoPaymentMethod>('UPI');
  const [demoUpiId, setDemoUpiId] = useState('alex@upi');
  const [demoCardNumber, setDemoCardNumber] = useState('4242 4242 4242 4242');
  const [demoCardExpiry, setDemoCardExpiry] = useState('12/28');
  const [demoCardCvv, setDemoCardCvv] = useState('888');
  const [demoCardHolder, setDemoCardHolder] = useState('Alex Kumar');
  const [demoBankName, setDemoBankName] = useState('HDFC Bank');
  const [demoSimulateMode, setDemoSimulateMode] = useState<'SUCCESS' | 'FAILED'>('SUCCESS');
  const [payStep, setPayStep] = useState<'DETAILS' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('DETAILS');
  const [confirmedTxnId, setConfirmedTxnId] = useState<string>('');
  const [confirmedAmount, setConfirmedAmount] = useState<number>(0);
  const [demoInvoiceUrl, setDemoInvoiceUrl] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  // Audio Toggle
  const [isSoundOn, setIsSoundOn] = useState(soundManager.isEnabled());

  const handleToggleSound = () => {
    const newState = soundManager.toggleSound();
    setIsSoundOn(newState);
    toast.info(newState ? 'Sound Alerts Enabled' : 'Sound Alerts Muted');
  };

  // 1. Initial Load: Context & Menu Data
  const loadMenuData = () => {
    setIsLoadingMenu(true);
    setMenuLoadError(null);

    Promise.all([restaurantService.getProfile(), menuService.getCategories(), menuService.getMenuItems()])
      .then(([restProfile, cats, items]) => {
        setProfile(restProfile);
        setCategories(cats);
        setMenuItems(items);
      })
      .catch((err) => {
        console.error('Error loading menu:', err);
        setMenuLoadError(err.message || 'Unable to connect to DineFlow menu engine');
      })
      .finally(() => setIsLoadingMenu(false));
  };

  useEffect(() => {
    // Read session identity from localStorage (saved in CustomerWelcomePage)
    const storedSession = localStorage.getItem('dineflow_active_session');
    if (storedSession) setSessionId(storedSession);

    // Look for stored member name & id
    const keys = Object.keys(localStorage);
    const tokenKey = keys.find((k) => k.startsWith('dineflow_name_'));
    if (tokenKey) {
      const name = localStorage.getItem(tokenKey);
      if (name) {
        setMyDisplayName(name);
        setAttributedMember({ id: 'guest-me', name });
      }
    }

    loadMenuData();
  }, []);

  // 2. Load Session Orders
  const loadOrders = async () => {
    if (!sessionId) return;
    setIsLoadingOrders(true);
    try {
      const orders = await orderService.getSessionOrders(sessionId);
      setSessionOrders(orders);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadOrders();

      // Connect to real-time socket room for this session
      socketService.joinSession(sessionId);
      const socket = socketService.getSocket();

      socket.on('ORDER_ACCEPTED', (order: IOrder) => {
        setSessionOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
        toast.info(`Round #${order.roundNumber} Accepted`, 'Chefs have queued your ticket in the kitchen');
      });

      socket.on('ORDER_PREPARING', (order: IOrder) => {
        setSessionOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
        toast.info(`Round #${order.roundNumber} Cooking`, 'Your dishes are on the stoves & grills');
      });

      socket.on('ORDER_READY', (order: IOrder) => {
        setSessionOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
        soundManager.playOrderReadyChime();
        toast.success(`Round #${order.roundNumber} Ready!`, 'Dishes are plated and ready for service');
      });

      socket.on('ORDER_UPDATED', (updatedOrder: IOrder) => {
        setSessionOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      });

      socket.on('NEW_ORDER', (newOrder: IOrder) => {
        setSessionOrders((prev) => {
          if (prev.some((o) => o._id === newOrder._id)) return prev;
          return [...prev, newOrder];
        });
      });

      socket.on('AVAILABILITY_CHANGED', (item: MenuItem) => {
        setMenuItems((prev) => prev.map((m) => (m._id === item._id ? item : m)));
        toast.info(
          item.available ? `${item.name} Back in Stock` : `${item.name} Sold Out`,
          'Menu item availability updated live'
        );
      });

      socket.on('STAFF_REQUEST_UPDATED', (req: any) => {
        if (req.status === 'IN_PROGRESS') {
          toast.success(
            'Waiter on the way',
            `${req.handledByStaffName || 'Staff'} is attending to Table ${tableNumber}`
          );
        }
      });

      socket.on('PAYMENT_COMPLETED', (payment: any) => {
        setPaymentSuccess(payment);
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      });

      return () => {
        socketService.leaveSession(sessionId);
        socket.off('ORDER_ACCEPTED');
        socket.off('ORDER_PREPARING');
        socket.off('ORDER_READY');
        socket.off('ORDER_UPDATED');
        socket.off('NEW_ORDER');
        socket.off('AVAILABILITY_CHANGED');
        socket.off('STAFF_REQUEST_UPDATED');
        socket.off('PAYMENT_COMPLETED');
      };
    }
  }, [sessionId, tableNumber]);

  // Filtered Menu Items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) return false;
    if (dietaryFilter === 'VEG' && item.foodType !== 'VEG') return false;
    if (dietaryFilter === 'NON_VEG' && item.foodType !== 'NON_VEG') return false;
    if (dietaryFilter === 'FEATURED' && !item.featured) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.ingredients?.some((ing) => ing.toLowerCase().includes(q)) ||
        item.allergens?.some((alg) => alg.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Featured items for top carousel
  const featuredDishes = menuItems.filter((m) => m.featured && m.available);

  // Open Customization & Food Detail Modal
  const handleOpenCustomization = (item: MenuItem) => {
    setCustomizingItem(item);
    setItemQuantity(1);
    setItemNotes('');
    setAttributedMember({ id: myMemberId, name: myDisplayName });
  };

  // Quick Add Directly from Food Card
  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.available) return;

    addItem(
      {
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        foodType: item.foodType,
        spiceLevel: item.spiceLevel,
        kitchenStation: item.kitchenStationId || 'Main Kitchen',
        preparationTime: item.preparationTime || 15,
        notes: '',
        sessionMemberId: myMemberId,
        sessionMemberName: myDisplayName,
      },
      1
    );

    // Audio chime + micro-animations
    soundManager.playCartAddPop();
    setRecentlyAddedId(item._id);
    setCartBadgeBump(true);
    setTimeout(() => setRecentlyAddedId(null), 1200);
    setTimeout(() => setCartBadgeBump(false), 500);

    toast.success(`Added ${item.name}`, `For ${myDisplayName}`);
  };

  // Add Item to Round Cart from Modal
  const handleAddToCart = () => {
    if (!customizingItem || !customizingItem.available) return;

    addItem(
      {
        menuItemId: customizingItem._id,
        name: customizingItem.name,
        price: customizingItem.price,
        image: customizingItem.image,
        foodType: customizingItem.foodType,
        spiceLevel: customizingItem.spiceLevel,
        kitchenStation: customizingItem.kitchenStationId || 'Main Kitchen',
        preparationTime: customizingItem.preparationTime || 15,
        notes: itemNotes.trim(),
        sessionMemberId: attributedMember.id,
        sessionMemberName: attributedMember.name,
      },
      itemQuantity
    );

    // Audio chime + bump
    soundManager.playCartAddPop();
    setCartBadgeBump(true);
    setTimeout(() => setCartBadgeBump(false), 500);

    toast.success(
      `Added to Round: ${customizingItem.name} (x${itemQuantity})`,
      `For ${attributedMember.name}`
    );
    setCustomizingItem(null);
  };

  // Submit Current Round Order (Phase 8 Backend Integration)
  const handlePlaceRoundOrder = async () => {
    if (cartItems.length === 0) return;
    if (!sessionId) {
      toast.error('Session Missing', 'Please scan a table QR code to start or join a dining session.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const itemsPayload = cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes,
        sessionMemberId: item.sessionMemberId,
        sessionMemberName: item.sessionMemberName,
      }));

      const res = await orderService.placeOrder({
        sessionId,
        memberId: myMemberId,
        memberName: myDisplayName,
        items: itemsPayload,
      });

      const roundNumber = res.data.roundNumber;
      const itemCount = res.data.items.length;

      clearCart();
      setIsCartOpen(false);
      await loadOrders();

      // Trigger Celebration & Modal
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.65 } });
      setOrderConfirmation({ roundNumber, itemCount });
      toast.success(
        `Round #${roundNumber} Sent to Kitchen!`,
        `${itemCount} dishes are now in prep queue.`
      );
    } catch (err: any) {
      toast.error('Order Placement Failed', err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Send Staff Assistance Call
  const handleSendServiceRequest = async () => {
    if (!sessionId) {
      toast.error('Session Missing', 'Please scan table QR code first.');
      return;
    }

    setIsSendingRequest(true);
    try {
      await staffRequestService.createRequest({
        sessionId,
        tableNumber,
        memberId: myMemberId,
        memberName: myDisplayName,
        requestType: serviceType,
        notes: serviceNotes,
      });

      setIsServiceModalOpen(false);
      setServiceNotes('');
      toast.success(
        'Request Dispatched to Waiter',
        `Table ${tableNumber} assistance (${serviceType}) alerted to floor staff.`
      );
    } catch (err: any) {
      toast.error('Failed to send request', err.message);
    } finally {
      setIsSendingRequest(false);
    }
  };

  // Fetch Bill with Split Mode support (Phase 12)
  const fetchBillSummary = async (
    mode: SplitMode = splitMode,
    count: number = splitCount,
    custom?: number
  ) => {
    if (!sessionId) {
      toast.error('Session Missing', 'Active dining session required to compute bill.');
      return;
    }

    try {
      const data = await paymentService.getBillSummary(
        sessionId,
        mode,
        myMemberId,
        count,
        custom !== undefined ? custom : customAmountInput ? Number(customAmountInput) : undefined
      );
      setBillData(data);
    } catch (err: any) {
      toast.error('Could Not Calculate Bill', err.message);
    }
  };

  const handleOpenBill = async () => {
    await fetchBillSummary(splitMode, splitCount);
  };

  const handleChangeSplitMode = async (newMode: SplitMode) => {
    setSplitMode(newMode);
    await fetchBillSummary(newMode, splitCount);
  };

  const handleChangeSplitCount = async (newCount: number) => {
    const validCount = Math.max(1, newCount);
    setSplitCount(validCount);
    await fetchBillSummary('EQUAL', validCount);
  };

  const handleApplyCustomAmount = async () => {
    const num = Number(customAmountInput);
    if (!num || num <= 0) {
      toast.error('Invalid Amount', 'Please enter a valid amount to pay.');
      return;
    }
    await fetchBillSummary('CUSTOM', splitCount, num);
  };

  // Open DineFlow Pay Demo Modal (Phase 13)
  const handleOpenDineFlowPay = () => {
    setPayStep('DETAILS');
    setPaymentError(null);
    setIsDineFlowPayOpen(true);
  };

  // Process Simulated Demo Payment (Phase 13)
  const handleProcessDemoPayment = async () => {
    if (!sessionId || !billData) return;

    setPayStep('PROCESSING');
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // 1. Backend calculates bill strictly on server & creates payment record
      const createRes = await paymentService.createDemoPayment({
        sessionId,
        splitMode,
        customerMemberId: myMemberId,
        splitCount,
        customAmount: splitMode === 'CUSTOM' ? Number(customAmountInput) : undefined,
        paymentMethod: selectedPayMethod,
        payerName: myDisplayName,
      });

      // Simulated authentic gateway delay for demo experience
      await new Promise((r) => setTimeout(r, 1200));

      // 2. Confirm demo payment with predictable outcome (SUCCESS or FAILED)
      const confirmRes = await paymentService.confirmDemoPayment({
        paymentId: createRes.paymentId,
        paymentMethod: selectedPayMethod,
        demoDetails: {
          upiVpa: selectedPayMethod === 'UPI' ? demoUpiId : undefined,
          cardLast4: selectedPayMethod === 'CARD' ? demoCardNumber.slice(-4) : undefined,
          cardHolder: selectedPayMethod === 'CARD' ? demoCardHolder : undefined,
          bankName: selectedPayMethod === 'NET_BANKING' ? demoBankName : undefined,
        },
        simulateResult: demoSimulateMode,
        failureReason:
          demoSimulateMode === 'FAILED'
            ? 'Demo payment could not be completed.'
            : undefined,
      });

      if (confirmRes.success) {
        setConfirmedTxnId(confirmRes.payment.demoTransactionId || createRes.demoTransactionId);
        setConfirmedAmount(confirmRes.payment.amount || createRes.amount);
        setDemoInvoiceUrl(confirmRes.invoiceUrl || `/api/payments/invoice/${sessionId}`);
        setPaymentSuccess(confirmRes.payment);
        setPayStep('SUCCESS');
        confetti({ particleCount: 160, spread: 85, origin: { y: 0.5 } });
        soundManager.playOrderReadyChime();
        toast.success(
          'Demo Payment Successful!',
          `Txn ID: ${confirmRes.payment.demoTransactionId}. Official invoice ready.`
        );
        fetchBillSummary(splitMode, splitCount);
      }
    } catch (err: any) {
      setPayStep('FAILED');
      setPaymentError(err.message || 'Demo payment could not be completed.');
      toast.error('Demo Payment Failed', err.message || 'Transaction could not be completed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const currency = profile?.currency || '₹';

  // Helper for spice meter icon
  const renderSpiceIndicator = (level: number) => {
    if (!level || level === 0) return null;
    return (
      <span className="flex items-center text-amber-500 gap-0.5" title={`Spice Level: ${level}/3`}>
        {Array.from({ length: level }).map((_, i) => (
          <Flame key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
        ))}
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-24 selection:bg-orange-500 selection:text-white">
      {/* 1. Restaurant Header Banner with Gradient Overlay */}
      <div className="relative h-48 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
        <img
          src={
            profile?.coverImage ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85'
          }
          alt="Restaurant Cover"
          className="w-full h-full object-cover scale-105 transition-transform duration-700 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="px-3 py-1 rounded-full bg-stone-950/80 text-white font-mono font-bold text-xs border border-orange-500/40 shadow-lg flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            TABLE {tableNumber}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-full bg-stone-950/80 text-stone-300 border border-stone-700/60 hover:text-white backdrop-blur-md transition-colors"
              title={isSoundOn ? 'Mute Sound' : 'Enable Sound'}
            >
              {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
            </button>
            <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-stone-950/80 text-stone-300 border border-stone-700/60 backdrop-blur-md">
              Session #{sessionNumber}
            </span>
          </div>
        </div>

        {/* Bottom Title, Logo & Branding */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-orange-500/40 bg-stone-900 shadow-xl shrink-0">
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/20">
                {currency} • Contemporary Bistro
              </span>
              <h1 className="text-lg font-black text-white font-serif tracking-tight truncate max-w-[220px] mt-0.5">
                {profile?.name || 'Saffron & Sage'}
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1 justify-end bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Kitchen Live
            </span>
          </div>
        </div>
      </div>

      {/* 2. Collaborative Companions Ribbon */}
      <div className="p-2.5 rounded-2xl bg-stone-900/80 border border-stone-800/90 flex items-center justify-between gap-2 overflow-x-auto shadow-md">
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-stone-400 font-medium">
          <Users className="w-3.5 h-3.5 text-orange-400" />
          <span>Diners:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {companions.map((comp, idx) => (
            <span
              key={idx}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap border ${
                comp.name.includes(myDisplayName) || idx === 0
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm'
                  : 'bg-stone-800 text-stone-300 border-stone-700/60'
              }`}
            >
              {comp.name}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-900/90 rounded-2xl border border-stone-800 shadow-md">
        <button
          onClick={() => setActiveTab('menu')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'menu'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-950/60'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Menu</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            loadOrders();
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-950/60'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Rounds</span>
          {sessionOrders.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-[10px] text-white flex items-center justify-center font-bold">
              {sessionOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('bill');
            handleOpenBill();
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'bill'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-950/60'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Bill & Pay</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: DIGITAL MENU */}
      {/* ============================================================ */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          {/* Search Bar with Instant Clear */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search gourmet dishes, spices, allergens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-stone-900/90 border border-stone-800 rounded-2xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dietary Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <button
              onClick={() => setDietaryFilter('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                dietaryFilter === 'ALL'
                  ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-700'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setDietaryFilter('VEG')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                dietaryFilter === 'VEG'
                  ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950'
                  : 'bg-stone-900 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Pure Veg
            </button>
            <button
              onClick={() => setDietaryFilter('NON_VEG')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                dietaryFilter === 'NON_VEG'
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-950'
                  : 'bg-stone-900 text-rose-400 border border-rose-500/30 hover:border-rose-500/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Non-Veg
            </button>
            <button
              onClick={() => setDietaryFilter('FEATURED')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                dietaryFilter === 'FEATURED'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-950'
                  : 'bg-stone-900 text-amber-400 border border-amber-500/30 hover:border-amber-500/60'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Chef Specials
            </button>
          </div>

          {/* Horizontal Scrolling Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-950'
                  : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-white'
              }`}
            >
              All Categories ({menuItems.length})
            </button>
            {categories.map((cat) => {
              const count = menuItems.filter((m) => m.categoryId === cat._id).length;
              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === cat._id
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-950'
                      : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-white'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Featured Highlights Section (when no search query active) */}
          {!searchQuery && selectedCategory === 'ALL' && dietaryFilter === 'ALL' && featuredDishes.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chef's Signature Creations</span>
                </h3>
                <span className="text-[10px] text-stone-400">Handcrafted highlights</span>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {featuredDishes.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleOpenCustomization(item)}
                    className="w-48 shrink-0 rounded-2xl bg-stone-900/90 border border-amber-500/30 p-2.5 space-y-2 cursor-pointer hover:border-amber-500/60 transition-all shadow-lg group relative"
                  >
                    <div className="h-28 rounded-xl overflow-hidden relative bg-stone-800">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow">
                        Chef Special
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs truncate">{item.name}</div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-xs font-extrabold text-orange-400">
                          {currency}
                          {item.price.toFixed(2)}
                        </span>

                        <button
                          onClick={(e) => handleQuickAdd(item, e)}
                          className="px-2 py-1 rounded-lg bg-orange-500 text-white text-[11px] font-bold shadow hover:bg-orange-600 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skeletons Loading State */}
          {isLoadingMenu ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-stone-900/40 border border-stone-800/80 animate-pulse flex gap-3.5"
                >
                  <div className="w-24 h-24 rounded-xl bg-stone-800/60 shrink-0" />
                  <div className="flex-1 space-y-2.5 py-1">
                    <div className="h-4 bg-stone-800/80 rounded w-2/3" />
                    <div className="h-3 bg-stone-800/50 rounded w-full" />
                    <div className="h-3 bg-stone-800/50 rounded w-4/5" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-4 bg-stone-800/80 rounded w-16" />
                      <div className="h-7 bg-stone-800/80 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : menuLoadError ? (
            <div className="p-6 rounded-2xl bg-stone-900 border border-rose-500/30 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Menu Unavailable</h3>
              <p className="text-xs text-stone-400">{menuLoadError}</p>
              <Button variant="primary" size="sm" onClick={loadMenuData}>
                Retry Connection
              </Button>
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title="No Dishes Match Your Search"
              description={
                searchQuery
                  ? `We couldn't find any dish matching "${searchQuery}".`
                  : 'No dishes found under this category or dietary filter.'
              }
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setDietaryFilter('ALL');
                    setSearchQuery('');
                  }}
                >
                  Reset All Filters
                </Button>
              }
            />
          ) : (
            /* Modern Food Cards List */
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isSoldOut = !item.available;
                const isJustAdded = recentlyAddedId === item._id;

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={!isSoldOut ? { y: -2 } : {}}
                    className={`p-3.5 rounded-2xl bg-stone-900/90 border transition-all flex gap-3.5 group cursor-pointer shadow-xl relative overflow-hidden ${
                      isSoldOut
                        ? 'border-stone-800 opacity-60 grayscale'
                        : 'border-stone-800/90 hover:border-orange-500/40'
                    }`}
                    onClick={() => handleOpenCustomization(item)}
                  >
                    {/* Dish Photography Thumbnail */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-stone-800 relative shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Sold Out Overlay */}
                      {isSoldOut ? (
                        <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-[2px] flex items-center justify-center p-1 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-700 font-mono font-bold text-[10px] uppercase">
                            Sold Out
                          </span>
                        </div>
                      ) : (
                        item.featured && (
                          <span className="absolute top-1.5 left-1.5 p-1 rounded-md bg-amber-500 text-stone-950 shadow-md">
                            <Sparkles className="w-3 h-3 fill-current" />
                          </span>
                        )
                      )}
                    </div>

                    {/* Dish Information */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Title & Dietary Indicator */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {/* Pure Veg / Non-Veg Icon */}
                          <span
                            className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${
                              item.foodType === 'VEG' ? 'border-emerald-500' : 'border-rose-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.foodType === 'VEG' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                          </span>

                          <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>

                          {/* Spice indicator */}
                          {renderSpiceIndicator(item.spiceLevel)}
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Allergen Tags */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.allergens.slice(0, 2).map((alg, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 text-[9px]"
                              >
                                {alg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Price & Add Action */}
                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-stone-800/80">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-orange-400 font-mono">
                            {currency}
                            {item.price.toFixed(2)}
                          </span>

                          {item.preparationTime && (
                            <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-stone-500" />
                              {item.preparationTime}m
                            </span>
                          )}
                        </div>

                        {/* Add Button with Micro-Animation */}
                        <motion.button
                          whileTap={!isSoldOut ? { scale: 0.92 } : {}}
                          disabled={isSoldOut}
                          onClick={(e) => handleQuickAdd(item, e)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md ${
                            isSoldOut
                              ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                              : isJustAdded
                              ? 'bg-emerald-500 text-white'
                              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-950/50'
                          }`}
                        >
                          {isSoldOut ? (
                            <span>86'd</span>
                          ) : isJustAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: LIVE ORDERS & TIMELINE */}
      {/* ============================================================ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Table Dining Rounds ({sessionOrders.length})</span>
            </h2>
            <Button variant="ghost" size="sm" onClick={loadOrders} className="text-xs">
              Refresh
            </Button>
          </div>

          {isLoadingOrders ? (
            <div className="py-12 text-center text-xs text-stone-400">Loading active tickets...</div>
          ) : sessionOrders.length === 0 ? (
            <EmptyState
              title="No Rounds Placed Yet"
              description="Browse the menu, add items for your table companions, and send Round 1 to the kitchen."
              action={
                <Button variant="primary" size="sm" onClick={() => setActiveTab('menu')}>
                  Browse Menu
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {sessionOrders.map((order) => {
                const statusOrder = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'];
                const currentIdx = statusOrder.indexOf(order.status);

                return (
                  <Card key={order._id} variant="default" className="border-stone-800 shadow-xl overflow-hidden">
                    <CardHeader className="p-3.5 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/60">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono font-bold border border-orange-500/30">
                          ROUND #{order.roundNumber}
                        </span>
                        <span className="text-xs text-stone-400">
                          by <strong className="text-stone-200">{order.placedByMemberName}</strong>
                        </span>
                      </div>

                      <Badge
                        variant={
                          order.status === 'READY'
                            ? 'success'
                            : order.status === 'PREPARING'
                            ? 'brand'
                            : order.status === 'ACCEPTED'
                            ? 'station'
                            : order.status === 'SERVED'
                            ? 'neutral'
                            : 'warning'
                        }
                        size="sm"
                        dot
                      >
                        {order.status}
                      </Badge>
                    </CardHeader>

                    <CardBody className="p-3.5 space-y-3">
                      {/* Step-by-Step Order Timeline */}
                      <div className="py-1">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-1.5">
                          Order Progress:
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                          {[
                            { key: 'PLACED', label: '1. Placed' },
                            { key: 'ACCEPTED', label: '2. Accepted' },
                            { key: 'PREPARING', label: '3. Cooking' },
                            { key: 'READY', label: '4. Ready' },
                          ].map((step, idx) => {
                            const isPastOrCurrent = currentIdx >= idx;
                            const isCurrent = currentIdx === idx;
                            return (
                              <div
                                key={step.key}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isCurrent
                                    ? 'bg-orange-500/20 text-orange-300 border-orange-500 ring-1 ring-orange-500/50'
                                    : isPastOrCurrent
                                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                                    : 'bg-stone-900 text-stone-600 border-stone-800'
                                }`}
                              >
                                {step.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items List in This Round */}
                      <div className="divide-y divide-stone-800/60 pt-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">
                                  {item.quantity}x {item.name}
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-400 flex items-center gap-2">
                                <span>👤 {item.sessionMemberName}</span>
                                <span className="text-stone-500">• {item.kitchenStation}</span>
                                {item.notes && <span className="italic text-amber-400">"{item.notes}"</span>}
                              </div>
                            </div>
                            <span className="font-mono text-stone-300 font-semibold shrink-0">
                              {currency}
                              {(item.priceSnapshot * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: VIEW BILL & SPLIT MODES (PHASE 12) */}
      {/* ============================================================ */}
      {activeTab === 'bill' && billData && (
        <div className="space-y-4">
          <Card variant="glass" className="border-stone-800 shadow-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-stone-800/80 bg-stone-900/40">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-mono tracking-wider">
                    Official Session Bill
                  </div>
                  <h2 className="text-base font-black text-white font-serif flex items-center gap-2">
                    <span>Table {billData.session.tableNumber}</span>
                    <span className="text-stone-500">•</span>
                    <span className="text-orange-400 font-mono text-sm">
                      #{billData.session.sessionNumber}
                    </span>
                  </h2>
                </div>
                <Badge
                  variant={paymentSuccess || billData.payment?.status === 'SUCCESS' ? 'success' : 'warning'}
                  size="sm"
                  dot
                >
                  {paymentSuccess || billData.payment?.status === 'SUCCESS' ? 'PAID' : 'PAYMENT PENDING'}
                </Badge>
              </div>

              {/* Split Mode Selector (Phase 12: Full, Own Items, Equal, Custom) */}
              {!(paymentSuccess || billData.payment?.status === 'SUCCESS') && (
                <div className="pt-3">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-1.5 flex items-center justify-between">
                    <span>Select Bill Split Mode:</span>
                    <span className="text-orange-400 font-bold">Backend Verified</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-950/80 rounded-xl border border-stone-800/90 text-xs">
                    {(
                      [
                        { id: 'FULL', label: 'Full Bill' },
                        { id: 'OWN_ITEMS', label: 'My Items' },
                        { id: 'EQUAL', label: 'Equal Split' },
                        { id: 'CUSTOM', label: 'Custom' },
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => handleChangeSplitMode(mode.id)}
                        className={`py-1.5 px-2 rounded-lg font-bold text-center transition-all ${
                          splitMode === mode.id
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-950/80'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Equal Split Diners Counter */}
                  {splitMode === 'EQUAL' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-stone-300 font-medium">Split equally among diners:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleChangeSplitCount(splitCount - 1)}
                          className="w-7 h-7 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-sm font-bold text-white w-6 text-center">
                          {splitCount}
                        </span>
                        <button
                          onClick={() => handleChangeSplitCount(splitCount + 1)}
                          className="w-7 h-7 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Custom Split Amount Input */}
                  {splitMode === 'CUSTOM' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-2 text-xs"
                    >
                      <label className="text-stone-300 block font-medium">Enter custom amount to pay:</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">
                            {currency}
                          </span>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            value={customAmountInput}
                            onChange={(e) => setCustomAmountInput(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                          />
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="font-bold shrink-0"
                          onClick={handleApplyCustomAmount}
                        >
                          Apply
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </CardHeader>

            <CardBody className="p-4 space-y-4">
              {/* Food Items Breakdown */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400 flex justify-between">
                  <span>Item Description</span>
                  <span>Qty • Price • Total</span>
                </div>

                <div className="divide-y divide-stone-800/80 max-h-56 overflow-y-auto pr-1">
                  {(billData.selectedSplit?.items || billData.summary.items || []).map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-bold text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-stone-400 flex items-center gap-1.5">
                          {item.orderedBy && (
                            <span className="px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">
                              👤 {item.orderedBy}
                            </span>
                          )}
                          {item.roundNumber && (
                            <span className="text-stone-500">R-{item.roundNumber}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-stone-400 font-mono">
                          {item.quantity} × {currency}{item.price.toFixed(2)}
                        </div>
                        <div className="font-mono font-bold text-stone-200">
                          {currency}{item.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal, Tax, and Grand Total */}
              <div className="pt-3 border-t border-stone-800 space-y-2 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>
                    Subtotal{' '}
                    {splitMode !== 'FULL' && (
                      <span className="text-orange-400 font-mono text-[10px]">
                        ({splitMode.replace('_', ' ')})
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-stone-200">
                    {currency}
                    {(billData.selectedSplit?.subtotal ?? billData.summary.subtotal).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-400">
                  <span>GST ({billData.restaurant.taxRate}%)</span>
                  <span className="font-mono text-stone-200">
                    {currency}
                    {(billData.selectedSplit?.tax ?? billData.summary.tax).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-400">
                  <span>Service Charge ({billData.restaurant.serviceRate}%)</span>
                  <span className="font-mono text-stone-200">
                    {currency}
                    {(billData.selectedSplit?.serviceCharge ?? billData.summary.serviceCharge).toFixed(2)}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-stone-800 flex justify-between items-center text-sm font-black text-white">
                  <span className="text-stone-200">Total Amount to Pay</span>
                  <span className="text-lg text-orange-400 font-mono font-black">
                    {currency}
                    {(billData.selectedSplit?.total ?? billData.summary.grandTotal).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action: Pay Now (Phase 12 & Phase 13) */}
              {!(paymentSuccess || billData.payment?.status === 'SUCCESS') ? (
                <div className="pt-2">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full font-bold shadow-glow-orange flex items-center justify-center gap-2"
                      onClick={handleOpenDineFlowPay}
                    >
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>
                        Pay Now • {currency}
                        {(billData.selectedSplit?.total ?? billData.summary.grandTotal).toFixed(2)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-glow-green">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Payment Successful</h3>
                    <p className="text-xs text-stone-300 font-mono mt-0.5">
                      Transaction: {paymentSuccess?.demoTransactionId || billData.payment?.demoTransactionId || billData.payment?.transactionId}
                    </p>
                  </div>

                  <a
                    href={`/api/payments/invoice/${sessionId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-lg hover:bg-orange-600 transition-colors w-full"
                  >
                    <Download className="w-4 h-4" />
                    Download Official Tax Invoice (PDF)
                  </a>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* DINEFLOW PAY (PHASE 13: SIMULATED DEMO PAYMENT MODAL) */}
      {/* ============================================================ */}
      <Modal
        isOpen={isDineFlowPayOpen}
        onClose={() => {
          if (!isProcessingPayment) setIsDineFlowPayOpen(false);
        }}
        title="DineFlow Pay"
        size="md"
      >
        <div className="space-y-4">
          {/* Header Banner with DEMO PAYMENT Badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-950 border border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">DineFlow Pay</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono font-bold">
                  DEMO PAYMENT
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Simulated checkout demonstration. No real financial data stored.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block font-mono">Amount Due</span>
              <span className="text-base font-black text-orange-400 font-mono">
                {currency}
                {(billData?.selectedSplit?.total ?? billData?.summary.grandTotal ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* STEP 1: ENTER DEMO DETAILS */}
          {payStep === 'DETAILS' && (
            <div className="space-y-4">
              {/* Method Selector: UPI | CARD | NET BANKING */}
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'CARD', 'NET_BANKING'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedPayMethod(method)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      selectedPayMethod === method
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500 shadow-md ring-1 ring-orange-500/50'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {method.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* UPI Form */}
              {selectedPayMethod === 'UPI' && (
                <div className="space-y-2 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
                  <label className="text-xs font-bold text-stone-300 block">UPI ID / VPA</label>
                  <Input
                    placeholder="example@upi"
                    value={demoUpiId}
                    onChange={(e) => setDemoUpiId(e.target.value)}
                  />
                  <div className="flex gap-1.5 text-[10px] text-stone-400 pt-1">
                    <span className="text-stone-500">Demo shortcuts:</span>
                    {['alex@okhdfcbank', 'sarah@okaxis', 'fail@upi'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setDemoUpiId(v)}
                        className="underline hover:text-white"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CARD Form */}
              {selectedPayMethod === 'CARD' && (
                <div className="space-y-2.5 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300">Card Number</label>
                    <Input
                      placeholder="4242 •••• •••• 4242"
                      value={demoCardNumber}
                      onChange={(e) => setDemoCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300">Expiry</label>
                      <Input
                        placeholder="MM/YY"
                        value={demoCardExpiry}
                        onChange={(e) => setDemoCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300">CVV</label>
                      <Input
                        placeholder="•••"
                        type="password"
                        maxLength={4}
                        value={demoCardCvv}
                        onChange={(e) => setDemoCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300">Cardholder Name</label>
                    <Input
                      placeholder="Alex Kumar"
                      value={demoCardHolder}
                      onChange={(e) => setDemoCardHolder(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* NET BANKING Form */}
              {selectedPayMethod === 'NET_BANKING' && (
                <div className="space-y-2 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
                  <label className="text-xs font-bold text-stone-300 block">Select Demo Bank</label>
                  <select
                    value={demoBankName}
                    onChange={(e) => setDemoBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="HDFC Bank">HDFC Bank Ltd.</option>
                    <option value="ICICI Bank">ICICI Bank Ltd.</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank Ltd.</option>
                    <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Testing Predictability Switch (Phase 13 requirement) */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">
                  Predictable Test Behavior:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDemoSimulateMode('SUCCESS')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                      demoSimulateMode === 'SUCCESS'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    ✓ Simulate Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoSimulateMode('FAILED')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                      demoSimulateMode === 'FAILED'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    × Simulate Failure
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-glow-orange"
                onClick={handleProcessDemoPayment}
              >
                Confirm Demo Payment ({currency}
                {(billData?.selectedSplit?.total ?? billData?.summary.grandTotal ?? 0).toFixed(2)})
              </Button>
            </div>
          )}

          {/* STEP 2: PROCESSING ANIMATION */}
          {payStep === 'PROCESSING' && (
            <div className="py-8 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-orange-400 absolute inset-0 m-auto animate-pulse" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">Processing Demo Payment</h3>
                <p className="text-xs text-stone-400 mt-1">
                  Connecting to DineFlow Pay gateway simulator...
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-stone-500 font-mono">
                <div>✓ Validating active dining session</div>
                <div>✓ Recalculating tax & split integrity</div>
                <div className="text-orange-400 animate-pulse">⚙ Awaiting backend confirmation...</div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS (Phase 13 user specified format) */}
          {payStep === 'SUCCESS' && (
            <div className="py-4 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500 shadow-glow-green text-3xl font-black"
              >
                ✓
              </motion.div>

              <div>
                <h3 className="text-lg font-black text-white">Payment Successful</h3>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {currency}{confirmedAmount.toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono">
                <span className="text-stone-400">Transaction:</span>
                <span className="text-white font-bold ml-1.5">{confirmedTxnId}</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={demoInvoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  View Invoice
                </a>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsDineFlowPayOpen(false)}
                >
                  Back to Table
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: FAILURE (Phase 13 user specified format) */}
          {payStep === 'FAILED' && (
            <div className="py-4 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border-2 border-rose-500 text-3xl font-black"
              >
                ×
              </motion.div>

              <div>
                <h3 className="text-lg font-black text-white">Payment Failed</h3>
                <p className="text-xs text-stone-400 mt-1">
                  {paymentError || 'Demo payment could not be completed.'}
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full font-bold"
                onClick={() => setPayStep('DETAILS')}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </Modal>


      {/* ============================================================ */}
      {/* 4. STICKY CART CAPSULE (PHASE 7 & 8 REQUIREMENT) */}
      {/* ============================================================ */}
      {activeTab === 'menu' && (
        <div className="fixed bottom-4 max-w-md w-full px-4 z-40 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {/* Call Waiter Quick Action */}
          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="p-3.5 rounded-2xl bg-stone-900 border border-stone-700/80 text-orange-400 shadow-2xl hover:bg-stone-800 transition-all shrink-0 flex items-center gap-1.5 text-xs font-bold"
            title="Call Waiter"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Assistance</span>
          </button>

          {/* Sticky Cart Button with Count Bump Animation */}
          <button
            onClick={() => setIsCartOpen(true)}
            disabled={getTotalCount() === 0}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-between shadow-2xl transition-all ${
              getTotalCount() > 0
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-950/70 hover:brightness-105'
                : 'bg-stone-900/90 text-stone-500 cursor-not-allowed border border-stone-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={cartBadgeBump ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-mono font-black"
              >
                {getTotalCount()}
              </motion.div>
              <span>Review Round Order</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-black">
                {currency}
                {getSubtotal().toFixed(2)}
              </span>
              <ChevronRight className="w-4 h-4 opacity-75" />
            </div>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. FOOD DETAIL & CUSTOMIZATION MODAL (PHASE 7 & 8) */}
      {/* ============================================================ */}
      <Modal
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        title={customizingItem?.name || 'Dish Details'}
        size="md"
      >
        {customizingItem && (
          <div className="space-y-4">
            {/* Full-bleed Food Image Banner */}
            <div className="h-48 w-full rounded-2xl overflow-hidden relative border border-stone-800">
              <img
                src={customizingItem.image}
                alt={customizingItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent" />

              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <Badge
                  variant={customizingItem.foodType === 'VEG' ? 'veg' : 'non-veg'}
                  size="sm"
                >
                  {customizingItem.foodType}
                </Badge>

                {customizingItem.spiceLevel > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-stone-900/90 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    Spice {customizingItem.spiceLevel}/3
                  </span>
                )}

                <span className="px-2 py-0.5 rounded-full bg-stone-900/90 text-stone-300 font-mono text-[10px] border border-stone-700">
                  {customizingItem.kitchenStationId || 'Main Kitchen'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-300 leading-relaxed">
              {customizingItem.description}
            </p>

            {/* Ingredients & Allergens */}
            <div className="space-y-2 pt-1 border-t border-stone-800">
              {customizingItem.ingredients && customizingItem.ingredients.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500">
                    Key Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {customizingItem.ingredients.map((ing, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px]">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {customizingItem.allergens && customizingItem.allergens.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400">
                    Allergen Notice:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {customizingItem.allergens.map((alg, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 text-[10px] border border-rose-900"
                      >
                        {alg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Diner Attribution (Phase 8 individual diner cart) */}
            <div className="space-y-1.5 pt-2 border-t border-stone-800">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                <span>Who is ordering this item?</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {companions.map((comp, idx) => {
                  const isSelected = attributedMember.id === comp.memberId;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAttributedMember({ id: comp.memberId, name: comp.name })}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-950'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {comp.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Chef Cooking Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300">
                Special Requests / Preparation Notes:
              </label>
              <Input
                placeholder="e.g. Extra spicy, no onions, gluten sensitivity..."
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
              />
            </div>

            {/* Quantity Selector & Price */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setItemQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-stone-800 text-stone-200 flex items-center justify-center hover:bg-stone-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-base font-bold text-white w-6 text-center">
                  {itemQuantity}
                </span>
                <button
                  onClick={() => setItemQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-xl bg-stone-800 text-stone-200 flex items-center justify-center hover:bg-stone-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-400 block font-mono">Item Total</span>
                <span className="text-lg font-black text-orange-400 font-mono">
                  {currency}
                  {(customizingItem.price * itemQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-glow-orange"
              onClick={handleAddToCart}
            >
              Add to Current Round ({currency}
              {(customizingItem.price * itemQuantity).toFixed(2)})
            </Button>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* 6. CURRENT ROUND CART DRAWER / REVIEW (PHASE 8) */}
      {/* ============================================================ */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Review Current Round"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Dishes in this round will be dispatched directly to chef stations.</span>
          </div>

          {/* Cart Items List */}
          <div className="divide-y divide-stone-800/80 max-h-72 overflow-y-auto pr-1">
            {cartItems.map((item, idx) => (
              <div key={idx} className="py-3 flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-bold text-white text-xs truncate">{item.name}</div>
                  <div className="text-[10px] text-stone-400 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-medium">
                      👤 {item.sessionMemberName}
                    </span>
                    <span className="text-stone-500">• {item.kitchenStation}</span>
                  </div>
                  {item.notes ? (
                    <div className="text-[10px] text-amber-400 italic">"{item.notes}"</div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.sessionMemberId, -1, item.notes)}
                      className="w-5 h-5 rounded flex items-center justify-center text-stone-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-white w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.sessionMemberId, 1, item.notes)}
                      className="w-5 h-5 rounded flex items-center justify-center text-stone-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-mono text-xs font-bold text-stone-200 w-14 text-right">
                    {currency}
                    {(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeItem(item.menuItemId, item.sessionMemberId, item.notes)}
                    className="text-stone-500 hover:text-rose-400 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal & Calculations */}
          <div className="pt-3 border-t border-stone-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Items Total ({getTotalCount()} items):</span>
              <span className="font-mono text-stone-200">
                {currency}
                {getSubtotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-white pt-1">
              <span>Estimated Round Total:</span>
              <span className="text-base text-orange-400 font-mono">
                {currency}
                {getSubtotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={clearCart}
              className="text-xs"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1 font-bold shadow-glow-orange"
              onClick={handlePlaceRoundOrder}
              isLoading={isPlacingOrder}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send Round to Kitchen
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* 7. ORDER CONFIRMATION CELEBRATION MODAL (PHASE 8) */}
      {/* ============================================================ */}
      <Modal
        isOpen={!!orderConfirmation}
        onClose={() => setOrderConfirmation(null)}
        title="Order Dispatched!"
        size="sm"
      >
        {orderConfirmation && (
          <div className="text-center space-y-4 py-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-glow-green"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>

            <div>
              <h3 className="text-base font-black text-white">
                Round #{orderConfirmation.roundNumber} Sent to Kitchen!
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {orderConfirmation.itemCount} dishes are now queued for Table {tableNumber}.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-400">Table:</span>
                <span className="font-bold text-white">Table {tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Est. Prep Time:</span>
                <span className="font-bold text-amber-400">~15-20 mins</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full font-bold"
              onClick={() => {
                setOrderConfirmation(null);
                setActiveTab('orders');
              }}
            >
              Track Live Timeline
            </Button>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* 8. CALL WAITER SERVICE MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title="Call Table Assistance"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-stone-400">
            Select the service needed at Table {tableNumber}. Floor staff will be alerted instantly.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'Water', icon: Droplet, label: 'Drinking Water' },
              { type: 'Cutlery', icon: Utensils, label: 'Extra Cutlery' },
              { type: 'Call Waiter', icon: Bell, label: 'Assistance' },
              { type: 'Request Bill', icon: Receipt, label: 'Request Bill' },
            ].map((srv) => {
              const Icon = srv.icon;
              const isSelected = serviceType === srv.type;
              return (
                <button
                  key={srv.type}
                  type="button"
                  onClick={() => setServiceType(srv.type)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500 shadow-md'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-white">{srv.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-stone-300">Additional details (optional):</label>
            <Input
              placeholder="e.g. Warm water, extra napkins, baby chair..."
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold"
            onClick={handleSendServiceRequest}
            isLoading={isSendingRequest}
          >
            Dispatch Alert to Floor Staff
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerMenuPage;
