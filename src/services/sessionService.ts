export interface JoinSessionResponse {
  success: boolean;
  message: string;
  data: {
    session: {
      id: string;
      sessionNumber: string;
      tableNumber: string;
      status: string;
      startedAt: string;
      memberCount: number;
    };
    currentMember: {
      displayName: string;
      temporaryMemberId: string;
      joinedAt: string;
    };
    members: Array<{
      displayName: string;
      temporaryMemberId: string;
      joinedAt: string;
    }>;
    table: {
      id: string;
      tableNumber: string;
      capacity: number;
      section: string;
    };
    restaurant: {
      name: string;
      coverImage?: string;
      logo?: string;
      currency?: string;
    };
  };
}

export interface TableIdeaItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  foodType: string;
  addedBy: string;
  addedAt: string;
}

export interface DiningPreferences {
  vegetarian?: boolean;
  spicy?: boolean;
  light?: boolean;
  filling?: boolean;
  budgetFriendly?: boolean;
  chefsPick?: boolean;
}

export interface TablePulseEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface TableRecommendation {
  dish: any;
  badge: string;
  reason: string;
}

export interface TableIntelligenceData {
  tableNumber: string;
  sessionNumber: string;
  diningStage: 'DISCOVERY' | 'STARTERS' | 'MAIN_COURSE' | 'DESSERT' | 'BILL';
  stageNudge: {
    title: string;
    message: string;
    actionText: string;
    actionStage: string;
  };
  recommendations: TableRecommendation[];
  pulseEvents: TablePulseEvent[];
  preferences: DiningPreferences;
  tableIdeas: TableIdeaItem[];
  memberCount: number;
  members: Array<{ displayName: string; temporaryMemberId: string; joinedAt: string }>;
  activeMoments: any[];
}

export interface DiningMemoryData {
  restaurantName: string;
  tagline: string;
  tableNumber: string;
  sessionNumber: string;
  date: string;
  diners: string[];
  roundsCount: number;
  dishesCount: number;
  dishesEnjoyed: Array<{ name: string; quantity: number; price: number; image?: string }>;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  thankYouMessage: string;
}

export const sessionService = {
  async joinSession(
    token: string,
    displayName: string,
    temporaryMemberId?: string
  ): Promise<JoinSessionResponse['data']> {
    const res = await fetch('/api/sessions/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, displayName, temporaryMemberId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to join table session');
    }

    return data.data;
  },

  async getSessionDetails(id: string) {
    const res = await fetch(`/api/sessions/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch session details');
    return data.data;
  },

  async getTableIntelligence(id: string): Promise<TableIntelligenceData> {
    const res = await fetch(`/api/sessions/${id}/intelligence`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch table intelligence');
    return data.data;
  },

  async getTableIdeas(id: string): Promise<TableIdeaItem[]> {
    const res = await fetch(`/api/sessions/${id}/ideas`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch table ideas');
    return data.data.tableIdeas;
  },

  async addTableIdea(id: string, menuItemId: string, addedBy: string): Promise<TableIdeaItem[]> {
    const res = await fetch(`/api/sessions/${id}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId, addedBy }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add table idea');
    return data.data.tableIdeas;
  },

  async removeTableIdea(id: string, ideaId: string): Promise<TableIdeaItem[]> {
    const res = await fetch(`/api/sessions/${id}/ideas/${ideaId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to remove table idea');
    return data.data.tableIdeas;
  },

  async updatePreferences(id: string, preferences: DiningPreferences): Promise<DiningPreferences> {
    const res = await fetch(`/api/sessions/${id}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update preferences');
    return data.data.preferences;
  },

  async getDiningMemory(id: string): Promise<DiningMemoryData> {
    const res = await fetch(`/api/sessions/${id}/memory`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch dining memory');
    return data.data;
  },

  async leaveOrCloseSession(
    sessionId: string,
    temporaryMemberId?: string,
    reason?: string
  ): Promise<{
    success: boolean;
    message: string;
    hasActiveOrders?: boolean;
    data?: { tableNumber: string };
  }> {
    const res = await fetch(`/api/sessions/${sessionId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temporaryMemberId, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      const error: any = new Error(data.message || 'Failed to leave table session');
      error.hasActiveOrders = data.hasActiveOrders;
      throw error;
    }
    return data;
  },
};
