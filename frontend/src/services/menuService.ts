import { getAuthHeaders } from '../stores/useAuthStore';

export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
  sortOrder: number;
  itemCount?: number;
}

export type FoodType = 'VEG' | 'NON_VEG' | 'VEGAN' | 'EGG';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  categoryId: Category | string;
  image: string;
  imagePublicId?: string;
  foodType: FoodType;
  spiceLevel: number;
  allergens: string[];
  ingredients: string[];
  preparationTime: number;
  kitchenStationId: string;
  available: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuFilters {
  categoryId?: string;
  foodType?: string;
  station?: string;
  available?: boolean;
  featured?: boolean;
  search?: string;
  sort?: string;
}

export const menuService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/menu/categories');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch categories');
    return data.data;
  },

  async createCategory(payload: Partial<Category>): Promise<Category> {
    const res = await fetch('/api/menu/categories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create category');
    return data.data;
  },

  async updateCategory(id: string, payload: Partial<Category>): Promise<Category> {
    const res = await fetch(`/api/menu/categories/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update category');
    return data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`/api/menu/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete category');
  },

  // Menu Items
  async getMenuItems(filters?: MenuFilters): Promise<MenuItem[]> {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.foodType) params.append('foodType', filters.foodType);
    if (filters?.station) params.append('station', filters.station);
    if (filters?.available !== undefined) params.append('available', String(filters.available));
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort) params.append('sort', filters.sort);

    const res = await fetch(`/api/menu/items?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch menu items');
    return data.data;
  },

  async createMenuItem(payload: Partial<MenuItem>): Promise<MenuItem> {
    const res = await fetch('/api/menu/items', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create menu item');
    return data.data;
  },

  async updateMenuItem(id: string, payload: Partial<MenuItem>): Promise<MenuItem> {
    const res = await fetch(`/api/menu/items/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update menu item');
    return data.data;
  },

  async toggleAvailability(id: string, available?: boolean): Promise<MenuItem> {
    const res = await fetch(`/api/menu/items/${id}/availability`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ available }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to toggle availability');
    return data.data;
  },

  async deleteMenuItem(id: string): Promise<void> {
    const res = await fetch(`/api/menu/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete menu item');
  },
};
