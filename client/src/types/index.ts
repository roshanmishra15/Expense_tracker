export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'read-only';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  description: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface AnalyticsData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
