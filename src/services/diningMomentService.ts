import { getAuthHeaders } from '../stores/useAuthStore';

export interface DiningMoment {
  _id: string;
  title: string;
  badge: string;
  description: string;
  image: string;
  menuItemIds: any[];
  startTime?: string;
  endTime?: string;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const diningMomentService = {
  // Public: get active moments
  async getActiveMoments(): Promise<DiningMoment[]> {
    const res = await fetch('/api/dining-moments/active');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch active dining moments');
    return data.data;
  },

  // Staff: get all moments
  async getAllMoments(): Promise<DiningMoment[]> {
    const res = await fetch('/api/dining-moments', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch dining moments');
    return data.data;
  },

  // Staff: create moment
  async createMoment(payload: Partial<DiningMoment>): Promise<DiningMoment> {
    const res = await fetch('/api/dining-moments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create dining moment');
    return data.data;
  },

  // Staff: update moment
  async updateMoment(id: string, payload: Partial<DiningMoment>): Promise<DiningMoment> {
    const res = await fetch(`/api/dining-moments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update dining moment');
    return data.data;
  },

  // Staff: toggle active state
  async toggleActive(id: string, active: boolean): Promise<DiningMoment> {
    return this.updateMoment(id, { active });
  },

  // Staff: delete moment
  async deleteMoment(id: string): Promise<void> {
    const res = await fetch(`/api/dining-moments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete dining moment');
  },
};
