export interface OperationsAdviceResponse {
  explanation: string;
  structuredContext: {
    timeframe: string;
    totalOrders: number;
    avgPrepTimeMinutes: number;
    targetPrepTimeMinutes: number;
    peakHourWindow: string;
    ordersInPeakHour: number;
    stationBreakdown: Record<string, number>;
    slowestDishes: Array<{ name: string; avgTimeMinutes: number; count: number }>;
    customNotesTicketsCount: number;
    staffServiceRequestsCount: number;
  };
  source: string;
  timestamp: string;
}

export interface MenuDescriptionDraftResponse {
  foodName: string;
  cookingMethod: string;
  draftDescription: string;
  source: string;
  status: 'DRAFT_FOR_REVIEW';
}

export const aiService = {
  /**
   * 1. RESTAURANT OPERATIONS ASSISTANT
   * Sends owner/manager queries with structured restaurant data aggregation
   */
  async getOperationsAdvice(
    query: string,
    timeRange: 'yesterday' | 'today' | 'last7days' = 'yesterday'
  ): Promise<OperationsAdviceResponse> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch('/api/ai/operations-advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': role || 'OWNER',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, timeRange }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to retrieve AI operations advice');
    }
    return data.data;
  },

  /**
   * 2. MENU DESCRIPTION ASSISTANT
   * Inputs: Food Name, Ingredients, Cooking Method
   * Returns a draft description for user review before saving
   */
  async generateMenuDescription(params: {
    foodName: string;
    ingredients: string;
    cookingMethod: string;
    category?: string;
    foodType?: string;
    spiceLevel?: number;
  }): Promise<MenuDescriptionDraftResponse> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch('/api/ai/menu-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': role || 'OWNER',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to generate menu description');
    }
    return data.data;
  },
};
