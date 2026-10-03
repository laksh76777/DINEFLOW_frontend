import { getAuthHeaders } from '../stores/useAuthStore';

export type TableStatus =
  | 'AVAILABLE'
  | 'ACTIVE'
  | 'ORDERING'
  | 'OCCUPIED'
  | 'PREPARING'
  | 'READY'
  | 'SERVING'
  | 'PAYMENT_PENDING'
  | 'PAYMENT';

export interface QRCodeData {
  token: string;
  active: boolean;
  generatedAt: string;
  regeneratedAt?: string;
  qrDataUrl?: string;
}

export interface TableItem {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  active: boolean;
  section: string;
  qrCode: QRCodeData;
  activeSession?: {
    id: string;
    sessionNumber: string;
    status: string;
    startedAt: string;
    memberCount: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResolveTableResponse {
  success: boolean;
  data: {
    table: {
      id: string;
      tableNumber: string;
      capacity: number;
      status: TableStatus;
      section: string;
      qrToken: string;
    };
    restaurant: {
      name: string;
      description: string;
      coverImage: string;
      logo: string;
      currency: string;
      openingTime?: string;
      closingTime?: string;
    };
    activeSession: {
      id: string;
      sessionNumber: string;
      status: string;
      startedAt: string;
      memberCount: number;
    } | null;
    existingMembers: Array<{
      displayName: string;
      temporaryMemberId: string;
      joinedAt: string;
    }>;
  };
}

export const tableService = {
  async getPublicTables(): Promise<TableItem[]> {
    const res = await fetch('/api/tables/public');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch public tables');
    return data.data;
  },

  async getAllTables(): Promise<TableItem[]> {
    const res = await fetch('/api/tables', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch tables');
    return data.data;
  },

  async createTable(payload: { tableNumber: string; capacity: number; section?: string }): Promise<TableItem> {
    const res = await fetch('/api/tables', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create table');
    return data.data;
  },

  async updateTable(id: string, payload: Partial<TableItem>): Promise<TableItem> {
    const res = await fetch(`/api/tables/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update table');
    return data.data;
  },

  async updateStatus(id: string, status: TableStatus): Promise<TableItem> {
    const res = await fetch(`/api/tables/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update table status');
    return data.data;
  },

  async toggleActive(id: string): Promise<TableItem> {
    const res = await fetch(`/api/tables/${id}/deactivate`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to toggle table activation');
    return data.data;
  },

  async regenerateQr(id: string): Promise<TableItem> {
    const res = await fetch(`/api/tables/${id}/regenerate-qr`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to regenerate QR code');
    return data.data;
  },

  async toggleQrActive(id: string): Promise<TableItem> {
    const res = await fetch(`/api/tables/${id}/toggle-qr`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to toggle QR active state');
    return data.data;
  },

  async resolveQrToken(token: string): Promise<ResolveTableResponse['data']> {
    const res = await fetch(`/api/tables/resolve/${token}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid or disabled table QR code');
    return data.data;
  },

  async getTableLiveDetails(id: string): Promise<{
    table: TableItem;
    session: any | null;
    members: any[];
    orders: any[];
    currentBill: {
      subtotal: number;
      tax: number;
      serviceCharge: number;
      grandTotal: number;
      itemCount: number;
    };
    requests: any[];
    payment: any | null;
    timeline: Array<{
      type: string;
      title: string;
      time: string;
      description: string;
    }>;
  }> {
    const res = await fetch(`/api/tables/${id}/live`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch table live details');
    return data.data;
  },

  downloadQrPng(token: string, tableNumber: string) {
    const link = document.createElement('a');
    link.href = `/api/tables/qr/${token}/download`;
    link.download = `DineFlow-Table-${tableNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
