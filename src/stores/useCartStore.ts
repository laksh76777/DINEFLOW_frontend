import { create } from 'zustand';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  foodType: string;
  spiceLevel: number;
  kitchenStation: string;
  preparationTime: number;
  quantity: number;
  notes: string;
  sessionMemberId: string;
  sessionMemberName: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (menuItemId: string, sessionMemberId: string, notes?: string) => void;
  updateQuantity: (menuItemId: string, sessionMemberId: string, delta: number, notes?: string) => void;
  updateItemNotes: (index: number, newNotes: string) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (newItem, quantity = 1) => {
    set((state) => {
      // Items match if same menuItemId AND same member AND same special instructions
      const existingIndex = state.items.findIndex(
        (i) =>
          i.menuItemId === newItem.menuItemId &&
          i.sessionMemberId === newItem.sessionMemberId &&
          i.notes === (newItem.notes || '')
      );

      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += quantity;
        return { items: updated };
      }

      return {
        items: [
          ...state.items,
          {
            ...newItem,
            notes: (newItem.notes || '').trim(),
            quantity,
          },
        ],
      };
    });
  },

  removeItem: (menuItemId, sessionMemberId, notes = '') => {
    set((state) => ({
      items: state.items.filter(
        (i) =>
          !(
            i.menuItemId === menuItemId &&
            i.sessionMemberId === sessionMemberId &&
            i.notes === notes
          )
      ),
    }));
  },

  updateQuantity: (menuItemId, sessionMemberId, delta, notes = '') => {
    set((state) => {
      const updated = state.items
        .map((item) => {
          if (
            item.menuItemId === menuItemId &&
            item.sessionMemberId === sessionMemberId &&
            item.notes === notes
          ) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      return { items: updated };
    });
  },

  updateItemNotes: (index: number, newNotes: string) => {
    set((state) => {
      const updated = [...state.items];
      if (updated[index]) {
        updated[index] = { ...updated[index], notes: newNotes.trim() };
      }
      return { items: updated };
    });
  },

  clearCart: () => set({ items: [] }),

  getTotalCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
