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
};
