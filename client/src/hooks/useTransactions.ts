import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { TransactionWithCategory, Transaction } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export function useTransactions(filters: TransactionFilters = {}) {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['/api/transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      return response.json() as Promise<{
        transactions: TransactionWithCategory[];
        total: number;
      }>;
    },
    enabled: !!token
  });
}

export function useCreateTransaction() {
  const { token } = useAuth();
  
  return useMutation({
    mutationFn: async (transactionData: {
      amount: number;
      description: string;
      categoryId: string;
      type: 'income' | 'expense';
      date: string;
    }) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create transaction');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    }
  });
}

export function useUpdateTransaction() {
  const { token } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: Partial<{
        amount: number;
        description: string;
        categoryId: string;
        type: 'income' | 'expense';
        date: string;
      }> 
    }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update transaction');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    }
  });
}

export function useDeleteTransaction() {
  const { token } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete transaction');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    }
  });
}
