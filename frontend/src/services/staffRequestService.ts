export interface StaffRequestItem {
  _id: string;
  session: string;
  tableNumber: string;
  memberId?: string;
  memberName?: string;
  requestType: 'Water' | 'Cutlery' | 'Call Waiter' | 'Request Bill' | 'Other';
  notes?: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED';
  handledByStaffName?: string;
  requestedAt: string;
  resolvedAt?: string;
}

export const staffRequestService = {
  // Customer creates service assistance call
  async createRequest(payload: {
    sessionId: string;
    tableNumber: string;
    memberId?: string;
    memberName?: string;
    requestType: string;
    notes?: string;
  }): Promise<StaffRequestItem> {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send request');
    return data.data;
  },

  // Staff: Get active requests
  async getActiveRequests(): Promise<StaffRequestItem[]> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch('/api/requests/active', {
      headers: {
        'x-demo-role': role || 'WAITER',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch requests');
    return data.data;
  },

  // Staff acknowledges request
  async acknowledgeRequest(id: string): Promise<StaffRequestItem> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch(`/api/requests/${id}/acknowledge`, {
      method: 'PATCH',
      headers: {
        'x-demo-role': role || 'WAITER',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to acknowledge request');
    return data.data;
  },

  // Staff marks request as resolved
  async resolveRequest(id: string): Promise<StaffRequestItem> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch(`/api/requests/${id}/resolve`, {
      method: 'PATCH',
      headers: {
        'x-demo-role': role || 'WAITER',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resolve request');
    return data.data;
  },

  // Staff updates request status directly (REQUESTED | ACCEPTED | IN_PROGRESS | COMPLETED)
  async updateStatus(id: string, status: string): Promise<StaffRequestItem> {
    const token = localStorage.getItem('dineflow_token');
    const role = localStorage.getItem('dineflow_role');

    const res = await fetch(`/api/requests/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': role || 'WAITER',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update request status');
    return data.data;
  },
};
