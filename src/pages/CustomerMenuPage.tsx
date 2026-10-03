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
  DoorOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { sessionService } from '../services/sessionService';
import { staffRequestService } from '../services/staffRequestService';
import { paymentService, BillSummary, SplitMode, DemoPaymentMethod } from '../services/paymentService';
import { analyticsService } from '../services/analyticsService';
import { socketService } from '../services/socketService';
import { useCartStore, CartItem } from '../stores/useCartStore';
import { toast } from '../stores/useToastStore';
import { TableSelectorModal } from '../components/common/TableSelectorModal';
import { TableIdeasDrawer } from '../components/tableIntelligence/TableIdeasDrawer';
import { TasteJourneyBar } from '../components/tableIntelligence/TasteJourneyBar';
import { HelpMeChooseModal } from '../components/tableIntelligence/HelpMeChooseModal';
import { TableIntelligenceBanner } from '../components/tableIntelligence/TableIntelligenceBanner';
import { DiningMomentHero } from '../components/tableIntelligence/DiningMomentHero';
import { DishStoryModal } from '../components/tableIntelligence/DishStoryModal';
import { TablePulseModal } from '../components/tableIntelligence/TablePulseModal';
import { DiningMemoryModal } from '../components/tableIntelligence/DiningMemoryModal';
import { diningMomentService, DiningMoment } from '../services/diningMomentService';
import { TableIdeaItem, DiningPreferences, TableIntelligenceData, DiningMemoryData } from '../services/sessionService';
import { soundManager } from '../utils/sound';
import { Heart, Compass, Sparkles as SparklesIcon } from 'lucide-react';

export const CustomerMenuPage: React.FC = () => {
  const navigate = useNavigate();

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'bill'>('menu');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  const handleConfirmLeaveTable = async () => {
    setIsSubmittingLeave(true);
    try {
      if (sessionId) {
        await sessionService.leaveOrCloseSession(
          sessionId,
          myMemberId,
          'Customer left without ordering'
        );
      }
    } catch (err: any) {
      if (err.hasActiveOrders) {
        toast.error(
          'Active Orders In Kitchen',
          'You have active orders in preparation. Please settle with staff before leaving.'
        );
        setIsSubmittingLeave(false);
        setIsLeaveModalOpen(false);
        return;
      }
      console.warn('Session leave notification failed, proceeding with local clear:', err);
    }

    clearCart();
    localStorage.removeItem('dineflow_active_session');
    localStorage.removeItem('dineflow_table_number');
    localStorage.removeItem('dineflow_session_number');
    localStorage.removeItem('dineflow_member_id');
    localStorage.removeItem('dineflow_member_name');
    localStorage.removeItem('dineflow_qr_token');
    localStorage.removeItem('dineflow_cart');
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('dineflow_temp_member_') || key.startsWith('dineflow_name_')) {
        localStorage.removeItem(key);
      }
    });

    setIsSubmittingLeave(false);
    setIsLeaveModalOpen(false);
    toast.success('Session Ended', `Table ${tableNumber || ''} has been released. Thank you for visiting Rasrang!`);
    navigate('/');
  };

  const handleLeaveTable = () => {
    setIsLeaveModalOpen(true);
  };

  // Restaurant & Session Context
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => localStorage.getItem('dineflow_active_session') || '');
  const [tableNumber, setTableNumber] = useState<string>(() => localStorage.getItem('dineflow_table_number') || '');
  const [sessionNumber, setSessionNumber] = useState<string>(() => localStorage.getItem('dineflow_session_number') || '');
  const [myMemberId, setMyMemberId] = useState<string>(() => localStorage.getItem('dineflow_member_id') || '');
  const [myDisplayName, setMyDisplayName] = useState<string>(() => localStorage.getItem('dineflow_member_name') || 'Guest');
  const [companions, setCompanions] = useState<Array<{ memberId: string; name: string }>>([]);

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
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

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

  // Table Intelligence V2 State
  const [tableIdeas, setTableIdeas] = useState<TableIdeaItem[]>([]);
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);
  const [preferences, setPreferences] = useState<DiningPreferences>({});
  const [isHelpMeChooseOpen, setIsHelpMeChooseOpen] = useState(false);
  const [tableIntelligence, setTableIntelligence] = useState<TableIntelligenceData | null>(null);
  const [diningMoments, setDiningMoments] = useState<DiningMoment[]>([]);
  const [storyDish, setStoryDish] = useState<MenuItem | null>(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isPulseOpen, setIsPulseOpen] = useState(false);
  const [diningMemory, setDiningMemory] = useState<DiningMemoryData | null>(null);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);

  // Audio Toggle
  const [isSoundOn, setIsSoundOn] = useState(soundManager.isEnabled());

  const handleToggleSound = () => {
    const newState = soundManager.toggleSound();
    setIsSoundOn(newState);
    toast.info(newState ? 'Sound Alerts Enabled' : 'Sound Alerts Muted');
  };

  const loadIntelligence = async (sessId: string = sessionId) => {
    if (!sessId) return;
    try {
      const data = await sessionService.getTableIntelligence(sessId);
      setTableIntelligence(data);
      if (data.tableIdeas) setTableIdeas(data.tableIdeas);
      if (data.preferences) setPreferences(data.preferences);
    } catch (err) {
      console.warn('Could not load table intelligence:', err);
    }
  };

  const loadDiningMoments = async () => {
    try {
      const moments = await diningMomentService.getActiveMoments();
      setDiningMoments(moments);
    } catch (err) {
      console.warn('Could not load dining moments:', err);
    }
  };

  const handleAddToIdeas = async (dish: MenuItem) => {
    if (!sessionId) {
      setIsTableModalOpen(true);
      toast.info('Select Table', 'Please select your table first to save Table Ideas.');
      return;
    }
    try {
      const updated = await sessionService.addTableIdea(sessionId, dish._id, myDisplayName);
      setTableIdeas(updated);
      toast.success('Saved to Table Ideas', `${dish.name} added to Table ${tableNumber} shared wishlist.`);
    } catch (err: any) {
      toast.error('Could not save idea', err.message);
    }
  };

  const handleRemoveIdea = async (ideaId: string) => {
    if (!sessionId) return;
    try {
      const updated = await sessionService.removeTableIdea(sessionId, ideaId);
      setTableIdeas(updated);
    } catch (err: any) {
      toast.error('Could not remove idea', err.message);
    }
  };

  const handleQuickAddDish = (dish: any) => {
    const item = menuItems.find((m) => m._id === (dish._id || dish.menuItemId)) || dish;
    addItem(
      {
        menuItemId: item._id || item.menuItemId,
        name: item.name,
        price: item.price,
        image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        foodType: item.foodType || 'VEG',
        spiceLevel: item.spiceLevel || 1,
        kitchenStation: item.kitchenStationId || 'Main Kitchen',
        preparationTime: item.preparationTime || 15,
        notes: '',
        sessionMemberId: myMemberId,
        sessionMemberName: myDisplayName,
      },
      1
    );
    soundManager.playCartAddPop();
    setRecentlyAddedId(item._id || item.menuItemId);
    setCartBadgeBump(true);
    setTimeout(() => setRecentlyAddedId(null), 1200);
    setTimeout(() => setCartBadgeBump(false), 500);
    toast.success(`Added ${item.name}`, `For ${myDisplayName}`);
  };

  const handleMoveIdeaToCart = (idea: TableIdeaItem) => {
    handleQuickAddDish({
      _id: idea.menuItemId,
      name: idea.name,
      price: idea.price,
      image: idea.image,
      foodType: idea.foodType,
    });
    setIsIdeasOpen(false);
  };

  const handleTogglePreference = async (key: keyof DiningPreferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    if (sessionId) {
      try {
        await sessionService.updatePreferences(sessionId, newPrefs);
      } catch (err) {
        console.warn('Could not update preferences on server:', err);
      }
    }
  };

  const handleOpenDishStory = (dish: MenuItem) => {
    setStoryDish(dish);
    setIsStoryOpen(true);
  };

  const handleOpenDiningMemory = async () => {
    if (!sessionId) return;
    try {
      const memory = await sessionService.getDiningMemory(sessionId);
      setDiningMemory(memory);
      setIsMemoryOpen(true);
    } catch (err: any) {
      toast.error('Dining Memory Unavailable', err.message);
    }
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
        setMenuLoadError(err.message || 'Unable to connect to DineSetu menu engine');
      })
      .finally(() => setIsLoadingMenu(false));
  };

  useEffect(() => {
    // Read session identity from localStorage (saved in CustomerWelcomePage)
    const storedSession = localStorage.getItem('dineflow_active_session');
    const storedTable = localStorage.getItem('dineflow_table_number');
    const storedSessionNum = localStorage.getItem('dineflow_session_number');
    const storedMemberId = localStorage.getItem('dineflow_member_id');
    const storedMemberName = localStorage.getItem('dineflow_member_name');

    if (storedSession) {
      setSessionId(storedSession);
      if (storedTable) setTableNumber(storedTable);
      if (storedSessionNum) setSessionNumber(storedSessionNum);
      if (storedMemberId) setMyMemberId(storedMemberId);
      if (storedMemberName) {
        setMyDisplayName(storedMemberName);
        setAttributedMember({ id: storedMemberId || 'guest-me', name: storedMemberName });
      }

      // Verify session with backend
      sessionService
        .getSessionDetails(storedSession)
        .then((res: any) => {
          if (res?.session) {
            // Check if session has been settled/completed
            if (res.session.status === 'COMPLETED' || res.session.status === 'CLOSED') {
              console.log('Session has ended and table released. Clearing session storage.');
              localStorage.removeItem('dineflow_active_session');
              localStorage.removeItem('dineflow_table_number');
              localStorage.removeItem('dineflow_session_number');
              localStorage.removeItem('dineflow_member_id');
              localStorage.removeItem('dineflow_member_name');
              localStorage.removeItem('dineflow_qr_token');
              setSessionId('');
              setTableNumber('');
              setSessionNumber('');
              setCompanions([]);
              toast.info('Session Ended', 'This dining session has ended and the table is now available.');
              return;
            }

            if (res.session.tableNumber) {
              setTableNumber(String(res.session.tableNumber));
              localStorage.setItem('dineflow_table_number', String(res.session.tableNumber));
            }
            if (res.session.sessionNumber) {
              setSessionNumber(String(res.session.sessionNumber));
              localStorage.setItem('dineflow_session_number', String(res.session.sessionNumber));
            }
            if (Array.isArray(res.members) && res.members.length > 0) {
              setCompanions(
                res.members.map((m: any) => ({
                  memberId: m.temporaryMemberId || m._id,
                  name: m.displayName,
                }))
              );
            }
          }
        })
        .catch((err: any) => {
          console.warn('Could not verify session with backend:', err);
          if (err?.message && err.message.toLowerCase().includes('not found')) {
            localStorage.removeItem('dineflow_active_session');
            localStorage.removeItem('dineflow_table_number');
            localStorage.removeItem('dineflow_session_number');
            setSessionId('');
            setTableNumber('');
            setSessionNumber('');
            setCompanions([]);
          }
        });
    }

    loadMenuData();
    loadDiningMoments();
    if (storedSession) {
      loadIntelligence(storedSession);
    }
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
        // Automatically fetch and prepare Dining Memory keepsake
        sessionService.getDiningMemory(sessionId).then((mem) => {
          setDiningMemory(mem);
          setIsMemoryOpen(true);
        }).catch(() => {});
      });

      // DineSetu V2: Real-time Table Ideas Sync
      socket.on('TABLE_IDEAS_UPDATED', (payload: any) => {
        if (payload?.tableIdeas) {
          setTableIdeas(payload.tableIdeas);
        }
      });

      // DineSetu V2: Real-time Preferences Sync
      socket.on('PREFERENCES_UPDATED', (payload: any) => {
        if (payload?.preferences) {
          setPreferences(payload.preferences);
        }
      });

      // DineSetu V2: Dining Moments live updates
      socket.on('DINING_MOMENT_UPDATED', () => {
        diningMomentService.getActiveMoments().then(setDiningMoments).catch(() => {});
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
        socket.off('TABLE_IDEAS_UPDATED');
        socket.off('PREFERENCES_UPDATED');
        socket.off('DINING_MOMENT_UPDATED');
      };
    }
  }, [sessionId, tableNumber]);

  // Check if item matches active taste preferences
  const itemMatchesPreferences = (item: MenuItem) => {
    if (!preferences) return false;
    let hasPreference = false;
    if (preferences.vegetarian) {
      hasPreference = true;
      if (item.foodType !== 'VEG' && item.foodType !== 'VEGAN') return false;
    }
    if (preferences.spicy) {
      hasPreference = true;
      if (item.spiceLevel < 2) return false;
    }
    if (preferences.chefsPick) {
      hasPreference = true;
      if (!item.isChefPick && !item.featured) return false;
    }
    if (preferences.budgetFriendly) {
      hasPreference = true;
      if (item.price > 350) return false;
    }
    if (preferences.light) {
      hasPreference = true;
      if (item.foodType !== 'VEGAN' && item.preparationTime > 12) return false;
    }
    return hasPreference;
  };

  // Filtered Menu Items (prioritizing preference matches)
  const filteredItems = menuItems
    .filter((item) => {
      if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) return false;
      if (dietaryFilter === 'VEG' && item.foodType !== 'VEG') return false;
      if (dietaryFilter === 'NON_VEG' && item.foodType !== 'NON_VEG') return false;
      if (dietaryFilter === 'FEATURED' && !item.featured && !item.isChefPick) return false;
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
    })
    .sort((a, b) => {
      const aMatch = itemMatchesPreferences(a) ? 1 : 0;
      const bMatch = itemMatchesPreferences(b) ? 1 : 0;
      return bMatch - aMatch;
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
      setIsCartOpen(false);
      setIsTableModalOpen(true);
      toast.info('Select Dining Table', 'Please choose your table to send this order to the kitchen.');
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
      setIsServiceModalOpen(false);
      setIsTableModalOpen(true);
      toast.info('Select Dining Table', 'Please select your table first so floor staff can assist you.');
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
    <div className="space-y-4 pb-24 selection:bg-[#d96236] selection:text-white">
      {/* 1. Restaurant Header Banner with Controlled Light Overlay */}
      <div className="relative h-48 rounded-3xl overflow-hidden border border-[#e9e3dc] shadow-md bg-white">
        <img
          src={
            profile?.coverImage ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85'
          }
          alt="Restaurant Cover"
          className="w-full h-full object-cover scale-105 transition-transform duration-700 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a]/80 via-[#211d1a]/30 to-transparent" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="px-3 py-1 rounded-full bg-white/95 text-[#211d1a] font-mono font-bold text-xs border border-[#e9e3dc] shadow-md flex items-center gap-1.5 backdrop-blur-md hover:border-[#d96236] transition-all cursor-pointer"
              title="Click to view all restaurant tables & QR codes"
            >
              <span className={`w-2 h-2 rounded-full ${tableNumber ? 'bg-[#059669] animate-pulse' : 'bg-[#e59b2a]'}`} />
              {tableNumber ? `TABLE ${tableNumber}` : 'CHOOSE TABLE • PREVIEW'}
            </button>

            {tableNumber && (
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="px-2.5 py-1 rounded-full bg-[#fde8e8]/95 hover:bg-[#fed7d7] text-[#c54e4a] font-bold text-xs border border-[#fca5a5] shadow-md flex items-center gap-1 backdrop-blur-md transition-all cursor-pointer"
                title="Decided not to eat? Leave table & release session"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-full bg-white/95 text-[#4d443c] border border-[#e9e3dc] hover:text-[#211d1a] backdrop-blur-md transition-colors shadow-sm"
              title={isSoundOn ? 'Mute Sound' : 'Enable Sound'}
            >
              {isSoundOn ? <Volume2 className="w-3.5 h-3.5 text-[#d96236]" /> : <VolumeX className="w-3.5 h-3.5 text-[#a69c93]" />}
            </button>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/95 text-[#4d443c] border border-[#e9e3dc] backdrop-blur-md shadow-sm font-semibold">
              {sessionNumber ? `Session #${sessionNumber}` : 'Preview Mode'}
            </span>
          </div>
        </div>

        {/* Bottom Title, Logo & Branding */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white bg-white shadow-lg shrink-0">
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#fff4ef] font-bold bg-[#d97706]/90 px-2 py-0.5 rounded shadow-sm">
                {currency} • Modern Indian Dining
              </span>
              <h1 className="text-lg font-black text-white font-serif tracking-tight truncate max-w-[220px] mt-0.5 drop-shadow-sm">
                {profile?.name || 'Rasrang'}
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#059669] font-mono font-semibold flex items-center gap-1 justify-end bg-white/95 px-2.5 py-1 rounded-full border border-[#a7f3d0] shadow-sm backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              Kitchen Live
            </span>
          </div>
        </div>
      </div>

      {/* 1.1. Preview Mode Notice Banner with Direct Table Selection */}
      {!sessionId && (
        <div className="p-3 rounded-2xl bg-[#fff4ef] border border-[#ffc9b5] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d96236] text-white flex items-center justify-center shrink-0 shadow-xs">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#211d1a]">You are viewing the menu in Preview Mode</p>
              <p className="text-[11px] text-[#7b726a]">Select an available table or scan your table QR to place orders &amp; split bills.</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTableModalOpen(true)}
            leftIcon={<QrCode className="w-3.5 h-3.5" />}
            className="shrink-0 text-xs py-1.5 px-3"
          >
            Choose Dining Table
          </Button>
        </div>
      )}

      {/* 2. Collaborative Companions Ribbon */}
      <div className="p-2.5 rounded-2xl bg-white border border-[#e9e3dc] flex items-center justify-between gap-2 overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-[#7b726a] font-medium">
          <Users className="w-3.5 h-3.5 text-[#d96236]" />
          <span>Diners:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {companions.map((comp, idx) => (
            <span
              key={idx}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap border ${
                comp.name.includes(myDisplayName) || idx === 0
                  ? 'bg-[#fff4ef] text-[#be4d27] border-[#ffc9b5] shadow-xs font-semibold'
                  : 'bg-[#fbf9f6] text-[#4d443c] border-[#e9e3dc]'
              }`}
            >
              {comp.name}
            </span>
          ))}
        </div>
      </div>

      {/* 2.5. Table Intelligence V2 Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => setIsIdeasOpen(true)}
          className="p-2.5 rounded-2xl bg-white border border-[#ecd7b7] hover:border-[#d97706] shadow-xs flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Heart className="w-4 h-4 fill-[#d97706]" />
          </div>
          <span className="text-[11px] font-bold text-[#211d1a]">Table Ideas</span>
          <span className="text-[10px] text-[#b45309] font-semibold">
            {tableIdeas.length} saved
          </span>
        </button>

        <button
          onClick={() => setIsHelpMeChooseOpen(true)}
          className="p-2.5 rounded-2xl bg-white border border-[#ecd7b7] hover:border-[#d97706] shadow-xs flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#fef3c7] to-[#fde68a] text-[#b45309] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4 text-[#b45309]" />
          </div>
          <span className="text-[11px] font-bold text-[#211d1a]">Help Choose</span>
          <span className="text-[10px] text-[#786c5e]">Guided picks</span>
        </button>

        <button
          onClick={() => {
            loadIntelligence();
            setIsPulseOpen(true);
          }}
          className="p-2.5 rounded-2xl bg-white border border-[#ecd7b7] hover:border-[#d97706] shadow-xs flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[#faf6ee] text-[#786c5e] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4 text-[#d97706]" />
          </div>
          <span className="text-[11px] font-bold text-[#211d1a]">Table Pulse</span>
          <span className="text-[10px] text-[#786c5e]">Live flow</span>
        </button>

        <button
          onClick={() => setIsServiceModalOpen(true)}
          className="p-2.5 rounded-2xl bg-white border border-[#ecd7b7] hover:border-[#d97706] shadow-xs flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[#fef7ee] text-[#d97706] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Bell className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#211d1a]">Steward</span>
          <span className="text-[10px] text-[#786c5e]">Assistance</span>
        </button>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f5f1ec] rounded-2xl border border-[#e9e3dc]">
        <button
          onClick={() => setActiveTab('menu')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'menu'
              ? 'bg-[#d96236] text-white shadow-sm'
              : 'text-[#7b726a] hover:text-[#211d1a]'
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
              ? 'bg-[#d96236] text-white shadow-sm'
              : 'text-[#7b726a] hover:text-[#211d1a]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Rounds</span>
          {sessionOrders.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#059669] text-[10px] text-white flex items-center justify-center font-bold">
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
              ? 'bg-[#d96236] text-white shadow-sm'
              : 'text-[#7b726a] hover:text-[#211d1a]'
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
          {/* Active Dining Moment (e.g. Tonight's Special) */}
          <DiningMomentHero
            moments={diningMoments}
            onOpenDishStory={handleOpenDishStory}
            onAddToCart={handleQuickAddDish}
          />

          {/* Table Intelligence Context Banner */}
          <TableIntelligenceBanner
            intelligence={tableIntelligence}
            onAddToCart={handleQuickAddDish}
            onAddToIdeas={handleAddToIdeas}
            onSelectCategory={(catName) => {
              const c = categories.find((cat) => cat.name.toLowerCase().includes(catName.toLowerCase()));
              if (c) setSelectedCategory(c._id);
            }}
            onRequestBill={() => {
              setActiveTab('bill');
              handleOpenBill();
            }}
          />

          {/* Taste Journey Mood Selector */}
          <TasteJourneyBar
            preferences={preferences}
            onTogglePreference={handleTogglePreference}
          />

          {/* Search Bar with Instant Clear */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a69c93]" />
            <input
              type="text"
              placeholder="Search gourmet dishes, spices, allergens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-[#e9e3dc] rounded-2xl text-xs text-[#211d1a] placeholder-[#a69c93] focus:outline-none focus:border-[#d96236] transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7b726a] hover:text-[#211d1a] p-1"
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
                  ? 'bg-[#211d1a] text-white font-bold shadow-xs'
                  : 'bg-white text-[#7b726a] border border-[#e9e3dc] hover:border-[#cfc5ba]'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setDietaryFilter('VEG')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                dietaryFilter === 'VEG'
                  ? 'bg-[#059669] text-white font-bold shadow-xs'
                  : 'bg-white text-[#059669] border border-[#a7f3d0] hover:bg-[#ecfdf5]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              Pure Veg
            </button>
            <button
              onClick={() => setDietaryFilter('NON_VEG')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                dietaryFilter === 'NON_VEG'
                  ? 'bg-[#dc2626] text-white font-bold shadow-xs'
                  : 'bg-white text-[#dc2626] border border-[#fecaca] hover:bg-[#fef2f2]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
              Non-Veg
            </button>
            <button
              onClick={() => setDietaryFilter('FEATURED')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                dietaryFilter === 'FEATURED'
                  ? 'bg-[#d97706] text-white font-bold shadow-xs'
                  : 'bg-white text-[#b45309] border border-[#fde68a] hover:bg-[#fffbeb]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#d97706]" />
              Chef Specials
            </button>
          </div>

          {/* Horizontal Scrolling Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-[#d96236] text-white shadow-xs'
                  : 'bg-white text-[#7b726a] border border-[#e9e3dc] hover:text-[#211d1a]'
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
                      ? 'bg-[#d96236] text-white shadow-xs'
                      : 'bg-white text-[#7b726a] border border-[#e9e3dc] hover:text-[#211d1a]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Featured Highlights Section */}
          {!searchQuery && selectedCategory === 'ALL' && dietaryFilter === 'ALL' && featuredDishes.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#b45309] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>Chef's Signature Creations</span>
                </h3>
                <span className="text-[10px] text-[#7b726a]">Handcrafted highlights</span>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {featuredDishes.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleOpenCustomization(item)}
                    className="w-48 shrink-0 rounded-2xl bg-white border border-[#fed7aa] p-2.5 space-y-2 cursor-pointer hover:border-[#f97316] transition-all shadow-sm group relative"
                  >
                    <div className="h-28 rounded-xl overflow-hidden relative bg-[#f5f1ec]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#d97706] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        Chef Special
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-[#211d1a] text-xs truncate">{item.name}</div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-xs font-extrabold text-[#d96236]">
                          {currency}
                          {item.price.toFixed(2)}
                        </span>

                        <button
                          onClick={(e) => handleQuickAdd(item, e)}
                          className="px-2 py-1 rounded-lg bg-[#d96236] text-white text-[11px] font-bold shadow-xs hover:bg-[#be4d27] transition-colors flex items-center gap-1"
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
                  className="p-3.5 rounded-2xl bg-white border border-[#e9e3dc] animate-pulse flex gap-3.5"
                >
                  <div className="w-24 h-24 rounded-xl bg-[#f5f1ec] shrink-0" />
                  <div className="flex-1 space-y-2.5 py-1">
                    <div className="h-4 bg-[#f5f1ec] rounded w-2/3" />
                    <div className="h-3 bg-[#f5f1ec] rounded w-full" />
                    <div className="h-3 bg-[#f5f1ec] rounded w-4/5" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-4 bg-[#f5f1ec] rounded w-16" />
                      <div className="h-7 bg-[#f5f1ec] rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : menuLoadError ? (
            <div className="p-6 rounded-2xl bg-white border border-[#fecaca] text-center space-y-3 shadow-xs">
              <AlertCircle className="w-8 h-8 text-[#dc2626] mx-auto" />
              <h3 className="text-sm font-bold text-[#211d1a]">Menu Unavailable</h3>
              <p className="text-xs text-[#7b726a]">{menuLoadError}</p>
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
                    className={`p-3.5 rounded-2xl bg-white border transition-all flex gap-3.5 group cursor-pointer shadow-xs relative overflow-hidden ${
                      isSoldOut
                        ? 'border-[#e9e3dc] opacity-60 grayscale'
                        : 'border-[#e9e3dc] hover:border-[#ffc9b5] hover:shadow-md'
                    }`}
                    onClick={() => handleOpenDishStory(item)}
                  >
                    {/* Dish Photography Thumbnail */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#f5f1ec] relative shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Sold Out Overlay */}
                      {isSoldOut ? (
                        <div className="absolute inset-0 bg-[#211d1a]/80 backdrop-blur-[2px] flex items-center justify-center p-1 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-[#dc2626] text-white font-mono font-bold text-[10px] uppercase">
                            Sold Out
                          </span>
                        </div>
                      ) : (
                        item.featured && (
                          <span className="absolute top-1.5 left-1.5 p-1 rounded-md bg-[#d97706] text-white shadow-sm">
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
                            className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 rounded-xs ${
                              item.foodType === 'VEG' ? 'border-[#059669]' : 'border-[#dc2626]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.foodType === 'VEG' ? 'bg-[#059669]' : 'bg-[#dc2626]'
                              }`}
                            />
                          </span>

                          <h3 className="text-sm font-bold text-[#211d1a] truncate font-serif">{item.name}</h3>

                          {/* Spice indicator */}
                          {renderSpiceIndicator(item.spiceLevel)}
                        </div>

                        {/* Smart Menu Signals */}
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {itemMatchesPreferences(item) && (
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                              ✨ Matches Preference
                            </span>
                          )}
                          {(item.isChefPick || item.featured) && (
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded">
                              ⭐ Chef's Pick
                            </span>
                          )}
                          {item.preparationTime <= 10 && (
                            <span className="text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.2 rounded">
                              ⏱ Quick
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-[#7b726a] line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Allergen Tags */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.allergens.slice(0, 2).map((alg, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.2 rounded bg-[#f5f1ec] text-[#4d443c] text-[9px] border border-[#e9e3dc]"
                              >
                                {alg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Price & Add Action */}
                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#f5f1ec]">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#d96236] font-mono">
                            {currency}
                            {item.price.toFixed(2)}
                          </span>

                          {item.preparationTime && (
                            <span className="text-[10px] text-[#7b726a] flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-[#a69c93]" />
                              {item.preparationTime}m
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Table Ideas Heart Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToIdeas(item);
                            }}
                            className="p-1.5 rounded-xl border border-[#ecd7b7] text-[#786c5e] hover:text-[#d97706] hover:bg-[#fef3c7] transition-colors"
                            title="Save to Table Ideas"
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>

                          {/* Add Button with Micro-Animation */}
                          <motion.button
                            whileTap={!isSoldOut ? { scale: 0.92 } : {}}
                            disabled={isSoldOut}
                            onClick={(e) => handleQuickAdd(item, e)}
                            className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs ${
                              isSoldOut
                                ? 'bg-[#f5f1ec] text-[#a69c93] cursor-not-allowed border border-[#e9e3dc]'
                                : isJustAdded
                                ? 'bg-[#059669] text-white'
                                : 'bg-[#d96236] hover:bg-[#be4d27] text-white'
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
            <h2 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d96236]" />
              <span>Table Dining Rounds ({sessionOrders.length})</span>
            </h2>
            <Button variant="ghost" size="sm" onClick={loadOrders} className="text-xs">
              Refresh
            </Button>
          </div>

          {isLoadingOrders ? (
            <div className="py-12 text-center text-xs text-[#7b726a]">Loading active tickets...</div>
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
                  <Card key={order._id} variant="default" className="border-[#e9e3dc] shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-3.5 border-b border-[#e9e3dc] flex items-center justify-between bg-[#fbf9f6]">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#fff4ef] text-[#be4d27] text-xs font-mono font-bold border border-[#ffc9b5]">
                          ROUND #{order.roundNumber}
                        </span>
                        <span className="text-xs text-[#7b726a]">
                          by <strong className="text-[#211d1a]">{order.placedByMemberName}</strong>
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
                        <div className="text-[10px] uppercase font-mono tracking-wider text-[#7b726a] mb-1.5">
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
                                    ? 'bg-[#fff4ef] text-[#be4d27] border-[#d96236] ring-1 ring-[#d96236]'
                                    : isPastOrCurrent
                                    ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
                                    : 'bg-[#f5f1ec] text-[#a69c93] border-[#e9e3dc]'
                                }`}
                              >
                                {step.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items List in This Round */}
                      <div className="divide-y divide-[#f5f1ec] pt-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#211d1a]">
                                  {item.quantity}x {item.name}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#7b726a] flex items-center gap-2">
                                <span>👤 {item.sessionMemberName}</span>
                                <span className="text-[#a69c93]">• {item.kitchenStation}</span>
                                {item.notes && <span className="italic text-[#d97706]">"{item.notes}"</span>}
                              </div>
                            </div>
                            <span className="font-mono text-[#4d443c] font-semibold shrink-0">
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
      {/* TAB 3: VIEW BILL & SPLIT MODES */}
      {/* ============================================================ */}
      {activeTab === 'bill' && billData && (
        <div className="space-y-4">
          <Card variant="default" className="border-[#e9e3dc] shadow-md overflow-hidden bg-white">
            <CardHeader className="p-4 border-b border-[#e9e3dc] bg-[#fbf9f6]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#7b726a] uppercase font-mono tracking-wider">
                    Official Session Bill
                  </div>
                  <h2 className="text-base font-black text-[#211d1a] font-serif flex items-center gap-2">
                    <span>Table {billData.session.tableNumber}</span>
                    <span className="text-[#a69c93]">•</span>
                    <span className="text-[#d96236] font-mono text-sm">
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
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#7b726a] mb-1.5 flex items-center justify-between">
                    <span>Select Bill Split Mode:</span>
                    <span className="text-[#d96236] font-bold">Backend Verified</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#f5f1ec] rounded-xl border border-[#e9e3dc] text-xs">
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
                            ? 'bg-[#d96236] text-white shadow-xs'
                            : 'text-[#7b726a] hover:text-[#211d1a]'
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
                      className="mt-2.5 p-2.5 rounded-xl bg-white border border-[#e9e3dc] flex items-center justify-between text-xs"
                    >
                      <span className="text-[#4d443c] font-medium">Split equally among diners:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleChangeSplitCount(splitCount - 1)}
                          className="w-7 h-7 rounded-lg bg-[#f5f1ec] text-[#4d443c] hover:bg-[#e9e3dc] flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-sm font-bold text-[#211d1a] w-6 text-center">
                          {splitCount}
                        </span>
                        <button
                          onClick={() => handleChangeSplitCount(splitCount + 1)}
                          className="w-7 h-7 rounded-lg bg-[#f5f1ec] text-[#4d443c] hover:bg-[#e9e3dc] flex items-center justify-center font-bold"
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
                      className="mt-2.5 p-2.5 rounded-xl bg-white border border-[#e9e3dc] space-y-2 text-xs"
                    >
                      <label className="text-[#4d443c] block font-medium">Enter custom amount to pay:</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a69c93] font-mono">
                            {currency}
                          </span>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            value={customAmountInput}
                            onChange={(e) => setCustomAmountInput(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-white border border-[#e9e3dc] rounded-xl text-xs text-[#211d1a] focus:outline-none focus:border-[#d96236] font-mono"
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
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#7b726a] flex justify-between">
                  <span>Item Description</span>
                  <span>Qty • Price • Total</span>
                </div>

                <div className="divide-y divide-[#f5f1ec] max-h-56 overflow-y-auto pr-1">
                  {(billData.selectedSplit?.items || billData.summary.items || []).map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-bold text-[#211d1a] truncate">{item.name}</div>
                        <div className="text-[10px] text-[#7b726a] flex items-center gap-1.5">
                          {item.orderedBy && (
                            <span className="px-1.5 py-0.2 rounded bg-[#f5f1ec] text-[#4d443c] border border-[#e9e3dc]">
                              👤 {item.orderedBy}
                            </span>
                          )}
                          {item.roundNumber && (
                            <span className="text-[#a69c93]">R-{item.roundNumber}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-[#7b726a] font-mono">
                          {item.quantity} × {currency}{item.price.toFixed(2)}
                        </div>
                        <div className="font-mono font-bold text-[#211d1a]">
                          {currency}{item.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal, Tax, and Grand Total */}
              <div className="pt-3 border-t border-[#e9e3dc] space-y-2 text-xs">
                <div className="flex justify-between text-[#7b726a]">
                  <span>
                    Subtotal{' '}
                    {splitMode !== 'FULL' && (
                      <span className="text-[#d96236] font-mono text-[10px]">
                        ({splitMode.replace('_', ' ')})
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[#211d1a]">
                    {currency}
                    {(billData.selectedSplit?.subtotal ?? billData.summary.subtotal).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-[#7b726a]">
                  <span>GST ({billData.restaurant.taxRate}%)</span>
                  <span className="font-mono text-[#211d1a]">
                    {currency}
                    {(billData.selectedSplit?.tax ?? billData.summary.tax).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-[#7b726a]">
                  <span>Service Charge ({billData.restaurant.serviceRate}%)</span>
                  <span className="font-mono text-[#211d1a]">
                    {currency}
                    {(billData.selectedSplit?.serviceCharge ?? billData.summary.serviceCharge).toFixed(2)}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-[#e9e3dc] flex justify-between items-center text-sm font-black text-[#211d1a]">
                  <span>Total Amount to Pay</span>
                  <span className="text-lg text-[#d96236] font-mono font-black">
                    {currency}
                    {(billData.selectedSplit?.total ?? billData.summary.grandTotal).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action: Pay Now */}
              {!(paymentSuccess || billData.payment?.status === 'SUCCESS') ? (
                <div className="pt-2">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full font-bold shadow-md shadow-[#d96236]/20 flex items-center justify-center gap-2"
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
                <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#d1fae5] text-[#059669] mx-auto flex items-center justify-center border border-[#a7f3d0]">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#065f46]">Payment Successful</h3>
                    <p className="text-xs text-[#047857] font-mono mt-0.5">
                      Transaction: {paymentSuccess?.demoTransactionId || billData.payment?.demoTransactionId || billData.payment?.transactionId}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <a
                      href={`/api/payments/invoice/${sessionId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#d96236] text-white font-bold text-xs shadow-sm hover:bg-[#be4d27] transition-colors w-full"
                    >
                      <Download className="w-4 h-4" />
                      Download Official Tax Invoice (PDF)
                    </a>
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full font-bold border-[#e9e3dc] text-[#211d1a] hover:bg-[#fff4ef] hover:border-[#d96236] flex items-center justify-center gap-2"
                      onClick={handleLeaveTable}
                      leftIcon={<DoorOpen className="w-4 h-4 text-[#d96236]" />}
                    >
                      Finish Dining & Leave Table
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* DINEFLOW PAY (SIMULATED DEMO PAYMENT MODAL) */}
      {/* ============================================================ */}
      <Modal
        isOpen={isDineFlowPayOpen}
        onClose={() => {
          if (!isProcessingPayment) setIsDineFlowPayOpen(false);
        }}
        title="DineSetu Pay"
        size="md"
      >
        <div className="space-y-4">
          {/* Header Banner with DEMO PAYMENT Badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#fff7ed] border border-[#fde68a]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#b45309] text-sm">DineSetu Pay</span>
                <span className="px-2 py-0.5 rounded-full bg-[#fed7aa] text-[#c2410c] border border-[#fdba74] text-[10px] font-mono font-bold">
                  DEMO PAYMENT
                </span>
              </div>
              <p className="text-[10px] text-[#7b726a] mt-0.5">
                Simulated checkout demonstration. No real financial data stored.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#7b726a] block font-mono">Amount Due</span>
              <span className="text-base font-black text-[#d96236] font-mono">
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
                        ? 'bg-[#fff4ef] text-[#be4d27] border-[#d96236] shadow-xs ring-1 ring-[#d96236]'
                        : 'bg-white text-[#7b726a] border-[#e9e3dc] hover:border-[#cfc5ba]'
                    }`}
                  >
                    {method.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* UPI Form */}
              {selectedPayMethod === 'UPI' && (
                <div className="space-y-2 p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc]">
                  <label className="text-xs font-bold text-[#4d443c] block">UPI ID / VPA</label>
                  <Input
                    placeholder="example@upi"
                    value={demoUpiId}
                    onChange={(e) => setDemoUpiId(e.target.value)}
                  />
                  <div className="flex gap-1.5 text-[10px] text-[#7b726a] pt-1">
                    <span className="text-[#a69c93]">Demo shortcuts:</span>
                    {['alex@okhdfcbank', 'sarah@okaxis', 'fail@upi'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setDemoUpiId(v)}
                        className="underline hover:text-[#d96236]"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CARD Form */}
              {selectedPayMethod === 'CARD' && (
                <div className="space-y-2.5 p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc]">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4d443c]">Card Number</label>
                    <Input
                      placeholder="4242 •••• •••• 4242"
                      value={demoCardNumber}
                      onChange={(e) => setDemoCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#4d443c]">Expiry</label>
                      <Input
                        placeholder="MM/YY"
                        value={demoCardExpiry}
                        onChange={(e) => setDemoCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#4d443c]">CVV</label>
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
                    <label className="text-xs font-bold text-[#4d443c]">Cardholder Name</label>
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
                <div className="space-y-2 p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc]">
                  <label className="text-xs font-bold text-[#4d443c] block">Select Demo Bank</label>
                  <select
                    value={demoBankName}
                    onChange={(e) => setDemoBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#e9e3dc] rounded-xl text-xs text-[#211d1a] focus:outline-none focus:border-[#d96236]"
                  >
                    <option value="HDFC Bank">HDFC Bank Ltd.</option>
                    <option value="ICICI Bank">ICICI Bank Ltd.</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank Ltd.</option>
                    <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Testing Predictability Switch */}
              <div className="p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-[#7b726a] font-bold">
                  Predictable Test Behavior:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDemoSimulateMode('SUCCESS')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                      demoSimulateMode === 'SUCCESS'
                        ? 'bg-[#059669] text-white shadow-xs'
                        : 'bg-white text-[#7b726a] border border-[#e9e3dc] hover:text-[#211d1a]'
                    }`}
                  >
                    ✓ Simulate Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoSimulateMode('FAILED')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                      demoSimulateMode === 'FAILED'
                        ? 'bg-[#dc2626] text-white shadow-xs'
                        : 'bg-white text-[#7b726a] border border-[#e9e3dc] hover:text-[#211d1a]'
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
                className="w-full font-bold shadow-md shadow-[#d96236]/20"
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
                <div className="w-16 h-16 rounded-full border-4 border-[#ffc9b5] border-t-[#d96236] animate-spin" />
                <Sparkles className="w-6 h-6 text-[#d96236] absolute inset-0 m-auto animate-pulse" />
              </div>

              <div>
                <h3 className="text-base font-black text-[#211d1a]">Processing Demo Payment</h3>
                <p className="text-xs text-[#7b726a] mt-1">
                  Connecting to DineSetu Pay gateway simulator...
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#7b726a] font-mono">
                <div>✓ Validating active dining session</div>
                <div>✓ Recalculating tax & split integrity</div>
                <div className="text-[#d96236] animate-pulse">⚙ Awaiting backend confirmation...</div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {payStep === 'SUCCESS' && (
            <div className="py-4 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-16 h-16 rounded-full bg-[#ecfdf5] text-[#059669] mx-auto flex items-center justify-center border-2 border-[#059669] shadow-sm text-3xl font-black"
              >
                ✓
              </motion.div>

              <div>
                <h3 className="text-lg font-black text-[#211d1a]">Payment Successful</h3>
                <div className="text-2xl font-black text-[#059669] font-mono mt-1">
                  {currency}{confirmedAmount.toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] text-xs font-mono">
                <span className="text-[#7b726a]">Transaction:</span>
                <span className="text-[#211d1a] font-bold ml-1.5">{confirmedTxnId}</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={demoInvoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#d96236] text-white font-bold text-xs shadow-sm hover:bg-[#be4d27] transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  Download Official Tax Invoice (PDF)
                </a>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full font-bold shadow-sm flex items-center justify-center gap-2"
                  onClick={() => {
                    setIsDineFlowPayOpen(false);
                    handleLeaveTable();
                  }}
                  leftIcon={<DoorOpen className="w-4 h-4" />}
                >
                  Finish Dining & Leave Table
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDineFlowPayOpen(false)}
                >
                  Stay on Table
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: FAILURE */}
          {payStep === 'FAILED' && (
            <div className="py-4 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-16 h-16 rounded-full bg-[#fef2f2] text-[#dc2626] mx-auto flex items-center justify-center border-2 border-[#dc2626] text-3xl font-black"
              >
                ×
              </motion.div>

              <div>
                <h3 className="text-lg font-black text-[#211d1a]">Payment Failed</h3>
                <p className="text-xs text-[#7b726a] mt-1">
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
      {/* 4. STICKY CART CAPSULE */}
      {/* ============================================================ */}
      {activeTab === 'menu' && (
        <div className="fixed bottom-4 max-w-md w-full px-4 z-40 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {/* Call Waiter Quick Action */}
          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="p-3.5 rounded-2xl bg-white border border-[#e9e3dc] text-[#d96236] shadow-lg hover:bg-[#fff4ef] transition-all shrink-0 flex items-center gap-1.5 text-xs font-bold"
            title="Call Waiter"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Assistance</span>
          </button>

          {/* Sticky Cart Button with Count Bump Animation */}
          <button
            onClick={() => setIsCartOpen(true)}
            disabled={getTotalCount() === 0}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-between shadow-lg transition-all ${
              getTotalCount() > 0
                ? 'bg-[#d96236] hover:bg-[#be4d27] text-white shadow-[#d96236]/30'
                : 'bg-white/95 text-[#a69c93] cursor-not-allowed border border-[#e9e3dc]'
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
      {/* 5. FOOD DETAIL & CUSTOMIZATION MODAL */}
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
            <div className="h-48 w-full rounded-2xl overflow-hidden relative border border-[#e9e3dc]">
              <img
                src={customizingItem.image}
                alt={customizingItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a]/80 via-transparent to-transparent" />

              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <Badge
                  variant={customizingItem.foodType === 'VEG' ? 'veg' : 'non-veg'}
                  size="sm"
                >
                  {customizingItem.foodType}
                </Badge>

                {customizingItem.spiceLevel > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/95 text-[#b45309] font-mono text-[10px] font-bold border border-[#fde68a] flex items-center gap-1 shadow-xs">
                    <Flame className="w-3 h-3 fill-[#d97706] text-[#d97706]" />
                    Spice {customizingItem.spiceLevel}/3
                  </span>
                )}

                <span className="px-2 py-0.5 rounded-full bg-white/95 text-[#4d443c] font-mono text-[10px] border border-[#e9e3dc] shadow-xs">
                  {customizingItem.kitchenStationId || 'Main Kitchen'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#4d443c] leading-relaxed">
              {customizingItem.description}
            </p>

            {/* Ingredients & Allergens */}
            <div className="space-y-2 pt-1 border-t border-[#e9e3dc]">
              {customizingItem.ingredients && customizingItem.ingredients.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#7b726a]">
                    Key Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {customizingItem.ingredients.map((ing, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#f5f1ec] text-[#4d443c] text-[10px] border border-[#e9e3dc]">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {customizingItem.allergens && customizingItem.allergens.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#dc2626]">
                    Allergen Notice:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {customizingItem.allergens.map((alg, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#fef2f2] text-[#dc2626] text-[10px] border border-[#fecaca]"
                      >
                        {alg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Diner Attribution */}
            <div className="space-y-1.5 pt-2 border-t border-[#e9e3dc]">
              <label className="text-xs font-bold text-[#4d443c] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#d96236]" />
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
                          ? 'bg-[#d96236] text-white font-bold shadow-xs'
                          : 'bg-[#f5f1ec] text-[#4d443c] hover:bg-[#e9e3dc] border border-[#e9e3dc]'
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
              <label className="text-xs font-bold text-[#4d443c]">
                Special Requests / Preparation Notes:
              </label>
              <Input
                placeholder="e.g. Extra spicy, no onions, gluten sensitivity..."
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
              />
            </div>

            {/* Quantity Selector & Price */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e9e3dc]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setItemQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-[#f5f1ec] text-[#4d443c] flex items-center justify-center hover:bg-[#e9e3dc] transition-colors border border-[#e9e3dc]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-base font-bold text-[#211d1a] w-6 text-center">
                  {itemQuantity}
                </span>
                <button
                  onClick={() => setItemQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-xl bg-[#f5f1ec] text-[#4d443c] flex items-center justify-center hover:bg-[#e9e3dc] transition-colors border border-[#e9e3dc]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#7b726a] block font-mono">Item Total</span>
                <span className="text-lg font-black text-[#d96236] font-mono">
                  {currency}
                  {(customizingItem.price * itemQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md shadow-[#d96236]/20"
              onClick={handleAddToCart}
            >
              Add to Current Round ({currency}
              {(customizingItem.price * itemQuantity).toFixed(2)})
            </Button>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* 6. CURRENT ROUND CART DRAWER / REVIEW */}
      {/* ============================================================ */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Review Current Round"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-2.5 rounded-xl bg-[#fff4ef] border border-[#ffc9b5] text-xs text-[#be4d27] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d96236] shrink-0" />
            <span>Dishes in this round will be dispatched directly to chef stations.</span>
          </div>

          {/* Cart Items List */}
          <div className="divide-y divide-[#f5f1ec] max-h-72 overflow-y-auto pr-1">
            {cartItems.map((item, idx) => (
              <div key={idx} className="py-3 flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-bold text-[#211d1a] text-xs truncate">{item.name}</div>
                  <div className="text-[10px] text-[#7b726a] flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#f5f1ec] text-[#4d443c] font-medium border border-[#e9e3dc]">
                      👤 {item.sessionMemberName}
                    </span>
                    <span className="text-[#a69c93]">• {item.kitchenStation}</span>
                  </div>
                  {item.notes ? (
                    <div className="text-[10px] text-[#d97706] italic">"{item.notes}"</div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex items-center gap-1 bg-[#f5f1ec] border border-[#e9e3dc] rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.sessionMemberId, -1, item.notes)}
                      className="w-5 h-5 rounded flex items-center justify-center text-[#7b726a] hover:text-[#211d1a]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-[#211d1a] w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.sessionMemberId, 1, item.notes)}
                      className="w-5 h-5 rounded flex items-center justify-center text-[#7b726a] hover:text-[#211d1a]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-mono text-xs font-bold text-[#211d1a] w-14 text-right">
                    {currency}
                    {(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeItem(item.menuItemId, item.sessionMemberId, item.notes)}
                    className="text-[#a69c93] hover:text-[#dc2626] p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal & Calculations */}
          <div className="pt-3 border-t border-[#e9e3dc] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#7b726a]">
              <span>Items Total ({getTotalCount()} items):</span>
              <span className="font-mono text-[#211d1a]">
                {currency}
                {getSubtotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-[#211d1a] pt-1">
              <span>Estimated Round Total:</span>
              <span className="text-base text-[#d96236] font-mono">
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
              className="flex-1 font-bold shadow-md shadow-[#d96236]/20"
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
      {/* 7. ORDER CONFIRMATION CELEBRATION MODAL */}
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
              className="w-14 h-14 rounded-full bg-[#ecfdf5] text-[#059669] mx-auto flex items-center justify-center border border-[#a7f3d0]"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>

            <div>
              <h3 className="text-base font-black text-[#211d1a]">
                Round #{orderConfirmation.roundNumber} Sent to Kitchen!
              </h3>
              <p className="text-xs text-[#7b726a] mt-1">
                {orderConfirmation.itemCount} dishes are now queued for Table {tableNumber}.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] text-xs text-[#4d443c] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#7b726a]">Table:</span>
                <span className="font-bold text-[#211d1a]">Table {tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7b726a]">Est. Prep Time:</span>
                <span className="font-bold text-[#d97706]">~15-20 mins</span>
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
          <p className="text-xs text-[#7b726a]">
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
                      ? 'bg-[#fff4ef] text-[#be4d27] border-[#d96236] shadow-xs ring-1 ring-[#d96236]'
                      : 'bg-white text-[#7b726a] border-[#e9e3dc] hover:border-[#cfc5ba]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#d96236]" />
                  <span className="text-xs font-bold text-[#211d1a]">{srv.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#4d443c]">Additional details (optional):</label>
            <Input
              placeholder="e.g. Warm water, extra napkins, baby chair..."
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-md shadow-[#d96236]/20"
            onClick={handleSendServiceRequest}
            isLoading={isSendingRequest}
          >
            Dispatch Alert to Floor Staff
          </Button>
        </div>
      </Modal>

      {/* Table Selector & QR Dining Modal */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />

      {/* Table Ideas Drawer (V2.1 Shared Wishlist) */}
      <TableIdeasDrawer
        isOpen={isIdeasOpen}
        onClose={() => setIsIdeasOpen(false)}
        tableIdeas={tableIdeas}
        onRemoveIdea={handleRemoveIdea}
        onMoveToCart={handleMoveIdeaToCart}
        tableNumber={tableNumber}
        myDisplayName={myDisplayName}
      />

      {/* Help Me Choose Guided Discovery Modal (V2.3) */}
      <HelpMeChooseModal
        isOpen={isHelpMeChooseOpen}
        onClose={() => setIsHelpMeChooseOpen(false)}
        onAddToCart={handleQuickAddDish}
        onAddToIdeas={handleAddToIdeas}
      />

      {/* Editorial Dish Story Sheet (V2.6 & V2.7) */}
      <DishStoryModal
        dish={storyDish}
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        onAddToCart={handleQuickAddDish}
        onAddToIdeas={handleAddToIdeas}
      />

      {/* Table Pulse Live Journey Timeline (V2.8) */}
      <TablePulseModal
        isOpen={isPulseOpen}
        onClose={() => setIsPulseOpen(false)}
        pulseEvents={tableIntelligence?.pulseEvents || []}
        tableNumber={tableNumber}
        sessionNumber={sessionNumber}
      />

      {/* Digital Dining Memory Keepsake (V2.9) */}
      <DiningMemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memory={diningMemory}
      />

      {/* Leave Table / Release Seat Confirmation Modal */}
      {isLeaveModalOpen && (
        <Modal
          isOpen={isLeaveModalOpen}
          onClose={() => !isSubmittingLeave && setIsLeaveModalOpen(false)}
          title="Leave Table & Release Seat"
          size="sm"
        >
          <div className="space-y-4 text-[#211d1a] font-sans">
            <div className="p-4 rounded-xl bg-[#fff8e7] border border-[#fed7aa] flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fff4ef] text-[#d96236] border border-[#ffc9b5] flex items-center justify-center shrink-0">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <strong className="font-bold text-[#211d1a] block">
                  Leave Table {tableNumber || ''} without ordering?
                </strong>
                <p className="text-[#786c5e] mt-1 leading-relaxed">
                  If you reviewed the menu and decided not to dine with us today, leaving will immediately end your dining session and release Table {tableNumber || ''} for other waiting guests.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#786c5e]">
              Any unplaced items in your order tray will be discarded. Are you sure you wish to leave?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e9e3dc]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsLeaveModalOpen(false)}
                disabled={isSubmittingLeave}
              >
                Stay & Browse
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmLeaveTable}
                disabled={isSubmittingLeave}
                className="bg-[#c54e4a] hover:bg-[#b0403c] border-[#b0403c] text-white flex items-center gap-1.5"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>{isSubmittingLeave ? 'Releasing Table...' : 'Yes, Leave Table'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerMenuPage;
