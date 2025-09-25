import { apiRequest } from './queryClient';

const TOKEN_KEY = 'finance_tracker_token';
const USER_KEY = 'finance_tracker_user';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const storeAuth = (token: string, user: any) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const login = async (email: string, password: string) => {
  const response = await apiRequest('POST', '/api/auth/login', { email, password });
  const data = await response.json();
  storeAuth(data.token, data.user);
  return data;
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: string;
}) => {
  const response = await apiRequest('POST', '/api/auth/register', userData);
  const data = await response.json();
  storeAuth(data.token, data.user);
  return data;
};
