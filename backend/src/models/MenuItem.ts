import mongoose, { Schema, Document } from 'mongoose';
import { FOOD_TYPES, FoodType, KITCHEN_STATIONS, KitchenStation } from '../config/constants.js';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  categoryId: mongoose.Types.ObjectId;
  image: string;
  imagePublicId?: string;
  foodType: FoodType;
  spiceLevel: number; // 0: None, 1: Mild, 2: Medium, 3: Hot
  allergens: string[];
  ingredients: string[];
  preparationTime: number; // in minutes
  kitchenStationId: KitchenStation;
  available: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    },
    imagePublicId: { type: String, default: '' },
    foodType: {
      type: String,
      enum: Object.values(FOOD_TYPES),
      default: FOOD_TYPES.VEG,
    },
    spiceLevel: { type: Number, default: 0, min: 0, max: 3 },
    allergens: [{ type: String }],
    ingredients: [{ type: String }],
    preparationTime: { type: Number, default: 15 },
    kitchenStationId: {
      type: String,
      enum: Object.values(KITCHEN_STATIONS),
      default: KITCHEN_STATIONS.MAIN_KITCHEN,
    },
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
