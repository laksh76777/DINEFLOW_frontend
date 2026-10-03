export interface OrderItemPayload {
  menuItemId: string;
  quantity: number;
  notes?: string;
  sessionMemberId: string;
  sessionMemberName: string;
}

export interface PlaceOrderPayload {
  sessionId: string;
  memberId: string;
  memberName: string;
  items: OrderItemPayload[];
}

export interface IOrderItem {
  _id: string;
  menuItem: any;
  name: string;
  priceSnapshot: number;
  quantity: number;
  sessionMemberId: string;
  sessionMemberName: string;
  notes?: string;
  kitchenStation: string;
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  preparedAt?: string;
  servedAt?: string;
}

export interface IOrder {
  _id: string;
  session: string;
  table: string;
  tableNumber: string;
  roundNumber: number;
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  items: IOrderItem[];
  placedByMemberId: string;
  placedByMemberName: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export const orderService = {
  // Place a new order / round
  async placeOrder(payload: PlaceOrderPayload): Promise<{ success: boolean; data: IOrder; sessionTotals: any }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order');
    return data;
  },

  // Get orders for customer session
  async getSessionOrders(sessionId: string): Promise<IOrder[]> {
    const res = await fetch(`/api/orders/session/${sessionId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch session orders');
    return data.data;
  },

  // Get active kitchen tickets
  async getActiveKitchenOrders(station?: string): Promise<IOrder[]> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');
    const query = station && station !== 'ALL' ? `?station=${encodeURIComponent(station)}` : '';

    const res = await fetch(`/api/orders/active${query}`, {
      headers: {
        'x-demo-role': role || 'KITCHEN',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch kitchen orders');
    return data.data;
  },

  // Update order status (Kitchen or Waiter)
  async updateOrderStatus(orderId: string, status: string, cancelReason?: string): Promise<IOrder> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': role || 'KITCHEN',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status, cancelReason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    return data.data;
  },

  // Update individual item status inside an order
  async updateOrderItemStatus(orderId: string, itemId: string, status: string): Promise<IOrder> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch(`/api/orders/${orderId}/item/${itemId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': role || 'KITCHEN',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update item status');
    return data.data;
  },

  // Waiter marks order as Served
  async serveOrder(orderId: string): Promise<IOrder> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch(`/api/orders/${orderId}/serve`, {
      method: 'PATCH',
      headers: {
        'x-demo-role': role || 'WAITER',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to mark order as served');
    return data.data;
  },
};
