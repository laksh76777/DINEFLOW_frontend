export type SplitMode = 'FULL' | 'OWN_ITEMS' | 'EQUAL' | 'CUSTOM';
export type DemoPaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING';

export interface BillItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  orderedBy?: string;
  roundNumber?: number;
}

export interface MemberSplitBreakdown {
  memberId: string;
  memberName: string;
  itemSubtotal: number;
  items: Array<{ name: string; quantity: number; price: number; total: number; roundNumber: number }>;
  proportionalTax: number;
  proportionalService: number;
  grandTotal: number;
}

export interface BillSummary {
  session: {
    id: string;
    sessionNumber: string;
    tableNumber: string;
    status: string;
    startedAt: string;
    endedAt?: string;
  };
  restaurant: {
    name: string;
    address: string;
    currency: string;
    taxRate: number;
    serviceRate: number;
    gstNumber: string;
  };
  orders: any[];
  summary: {
    subtotal: number;
    tax: number;
    serviceCharge: number;
    grandTotal: number;
    itemCount: number;
    items: BillItem[];
  };
  memberSplits: MemberSplitBreakdown[];
  selectedSplit: {
    mode: SplitMode;
    subtotal: number;
    tax: number;
    serviceCharge: number;
    total: number;
    items: BillItem[];
  };
  payment?: {
    _id: string;
    transactionId: string;
    demoTransactionId: string;
    amount: number;
    method: string;
    status: string;
    completedAt?: string;
  } | null;
}

export interface CreateDemoPaymentPayload {
  sessionId: string;
  splitMode: SplitMode;
  customerMemberId?: string;
  splitCount?: number;
  customAmount?: number;
  paymentMethod: DemoPaymentMethod;
  payerName?: string;
}

export interface ConfirmDemoPaymentPayload {
  paymentId: string;
  paymentMethod: DemoPaymentMethod;
  demoDetails?: {
    upiVpa?: string;
    cardLast4?: string;
    cardHolder?: string;
    bankName?: string;
  };
  simulateResult: 'SUCCESS' | 'FAILED';
  failureReason?: string;
}

export const paymentService = {
  // 1. Get bill summary with full calculation breakdown (Phase 12)
  async getBillSummary(
    sessionId: string,
    splitMode: SplitMode = 'FULL',
    memberId?: string,
    splitCount: number = 1,
    customAmount?: number
  ): Promise<BillSummary> {
    const params = new URLSearchParams({
      splitMode,
      ...(memberId ? { memberId } : {}),
      ...(splitCount ? { splitCount: splitCount.toString() } : {}),
      ...(customAmount ? { customAmount: customAmount.toString() } : {}),
    });

    const res = await fetch(`/api/payments/bill/${sessionId}?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch bill summary');
    return data.data;
  },

  // 2. Phase 13: Create Demo Payment (Server-side calculation)
  async createDemoPayment(payload: CreateDemoPaymentPayload): Promise<{
    paymentId: string;
    demoTransactionId: string;
    amount: number;
    currency: string;
    status: string;
    breakdown: any;
  }> {
    const res = await fetch('/api/payments/demo/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to initialize DineFlow Pay demo transaction');
    return data.data;
  },

  // 3. Phase 13: Confirm Demo Payment (Predictable test results)
  async confirmDemoPayment(payload: ConfirmDemoPaymentPayload): Promise<{
    success: boolean;
    payment: any;
    invoice: any;
    invoiceUrl: string;
  }> {
    const res = await fetch('/api/payments/demo/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Demo payment was declined');
    return data.data;
  },

  // 4. Phase 13: Get Payment by ID
  async getPayment(id: string): Promise<any> {
    const res = await fetch(`/api/payments/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch payment record');
    return data.data;
  },

  // 5. Backwards-compatible simulate payment
  async simulatePayment(payload: any): Promise<{
    success: boolean;
    data: { payment: any; session: any; invoiceUrl: string };
  }> {
    const res = await fetch('/api/payments/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment transaction failed');
    return data;
  },

  // 6. Get official PDF tax invoice URL
  getInvoicePdfUrl(sessionId: string): string {
    return `/api/payments/invoice/${sessionId}`;
  },
};
