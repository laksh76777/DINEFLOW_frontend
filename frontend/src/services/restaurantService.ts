import { getAuthHeaders } from '../stores/useAuthStore';

export interface TaxConfiguration {
  taxRate: number;
  serviceChargeRate: number;
  gstNumber: string;
}

export interface ThemeConfiguration {
  primaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  mode: 'dark' | 'light' | 'luxury';
}

export interface RestaurantProfile {
  _id?: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  address: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  currency: string;
  taxConfiguration: TaxConfiguration;
  supportedLanguages: string[];
  themeConfiguration: ThemeConfiguration;
}

export const restaurantService = {
  async getProfile(): Promise<RestaurantProfile> {
    const response = await fetch('/api/restaurant');
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch restaurant profile');
    return data.data;
  },

  async updateProfile(profile: Partial<RestaurantProfile>): Promise<RestaurantProfile> {
    const response = await fetch('/api/restaurant', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update restaurant profile');
    return data.data;
  },
};
