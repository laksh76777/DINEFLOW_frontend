import mongoose, { Schema, Document } from 'mongoose';

export type SessionStatus = 'ACTIVE' | 'PAYMENT_PENDING' | 'COMPLETED';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID';

export interface ITableSession extends Document {
  tableId: mongoose.Types.ObjectId;
  tableNumber: string;
  sessionNumber: string; // e.g. #8291
  status: SessionStatus;
  startedAt: Date;
  endedAt?: Date | null;
  memberCount: number;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TableSessionSchema = new Schema<ITableSession>(
  {
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    tableNumber: { type: String, required: true },
    sessionNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAYMENT_PENDING', 'COMPLETED'],
      default: 'ACTIVE',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    memberCount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PENDING', 'PAID'],
      default: 'UNPAID',
    },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TableSession = mongoose.model<ITableSession>('TableSession', TableSessionSchema);
