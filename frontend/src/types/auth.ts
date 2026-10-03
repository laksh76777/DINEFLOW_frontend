export type Role = 'OWNER' | 'MANAGER' | 'KITCHEN' | 'WAITER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  active: boolean;
  station?: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}
