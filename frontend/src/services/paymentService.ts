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
  };
  memberSplits: Array<{
    memberId: string;
    memberName: string;
    itemSubtotal: number;
    items: Array<{ name: string; quantity: number; price: number; total: number; round: number }>;
    proportionalTax: number;
    proportionalService: number;
    grandTotal: number;
  }>;
  payment?: {
    transactionId: string;
    amount: number;
    method: string;
    status: string;
    completedAt?: string;
  } | null;
}

export interface SimulatePaymentPayload {
  sessionId: string;
  method: 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH';
  payerName: string;
  payerMemberId?: string;
  paymentDetails?: {
    upiVpa?: string;
    cardLast4?: string;
    bankName?: string;
  };
  shouldFail?: boolean;
}

export const paymentService = {
  // Get bill summary with split calculations
  async getBillSummary(sessionId: string): Promise<BillSummary> {
    const res = await fetch(`/api/payments/bill/${sessionId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch bill summary');
    return data.data;
  },

  // Simulate payment checkout
  async simulatePayment(payload: SimulatePaymentPayload): Promise<{
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

  // Get invoice PDF download URL
  getInvoicePdfUrl(sessionId: string): string {
    return `/api/payments/invoice/${sessionId}`;
  },
};
