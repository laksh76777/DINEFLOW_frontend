export interface DashboardAnalytics {
  metrics: {
    totalRevenue: number;
    totalSubtotal: number;
    totalTax: number;
    occupiedTables: number;
    totalTables: number;
    occupancyRate: number;
    completedSessionsCount: number;
    totalDinersServed: number;
    avgDiningMinutes: number;
    avgTicket: number;
    currency: string;
  };
  popularItems: Array<{
    name: string;
    count: number;
    revenue: number;
    station: string;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    orders: number;
    revenue: number;
  }>;
  stationData: Array<{
    name: string;
    value: number;
  }>;
}

export const analyticsService = {
  // Get executive operational analytics
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch('/api/analytics/dashboard', {
      headers: {
        'x-demo-role': role || 'OWNER',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');
    return data.data;
  },

  // Gemini AI Operations Advisor query
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
