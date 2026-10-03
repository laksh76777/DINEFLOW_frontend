export type AnalyticsEventType =
  | 'QR_SCAN'
  | 'SESSION_STARTED'
  | 'SESSION_JOINED'
  | 'MENU_VIEW'
  | 'ITEM_VIEW'
  | 'ADD_TO_CART'
  | 'ORDER_CREATED'
  | 'ORDER_COMPLETED'
  | 'PAYMENT_SUCCESS'
  | 'SESSION_COMPLETED'
  | 'STAFF_REQUEST';

export interface DashboardAnalytics {
  timeRange: string;
  currency: string;
  metrics: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    activeTables: number;
    totalTables: number;
    occupancyRate: number;
    averageSessionDuration: number;
    preparationTime: number;
    totalDinersServed: number;
    completedSessionsCount: number;
    totalItemViews: number;
    subtotal: number;
    tax: number;
  };
  popularFoods: Array<{
    name: string;
    count: number;
    revenue: number;
    station: string;
  }>;
  itemViews: {
    total: number;
    topItems: Array<{ name: string; views: number }>;
  };
  peakHours: Array<{
    hour: string;
    orders: number;
    revenue: number;
  }>;
  stationWorkload: Array<{
    name: string;
    value: number;
  }>;
  tableUsage: Array<{
    tableNumber: string;
    sessions: number;
    orders: number;
  }>;
  soldOutFrequency: {
    count: number;
    items: Array<{ name: string; category?: string }>;
  };
}

export const analyticsService = {
  // 1. Client telemetry tracking (Phase 14)
  async trackEvent(
    eventType: AnalyticsEventType,
    sessionId?: string,
    tableNumber?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          sessionId,
          tableNumber,
          metadata,
        }),
      });
    } catch (e) {
      // Fire-and-forget telemetry silently
    }
  },

  // 2. Get executive operational analytics with date filter
  async getDashboardAnalytics(timeRange: 'today' | '7d' | '30d' | 'all' = 'all'): Promise<DashboardAnalytics> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`, {
      headers: {
        'x-demo-role': role || 'OWNER',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');
    return data.data;
  },

  // 3. Gemini AI Operations Advisor query
  async askAiAdvisor(prompt: string): Promise<{ advice: string; source: string }> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch('/api/analytics/ai-advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': role || 'OWNER',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI advisor request failed');
    return data;
  },
};
