import React, { useState, useMemo, useCallback } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import TransactionTable from '@/components/Transaction/TransactionTable';
import TransactionForm from '@/components/Transaction/TransactionForm';
import TransactionFilters from '@/components/Transaction/TransactionFilters';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionWithCategory } from '@/types';
import { Plus } from 'lucide-react';

export default function Transactions() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: 'all',
    type: 'all',
    dateRange: 'all'
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | undefined>();

  const canEdit = user?.role !== 'read-only';
  const limit = 20;

  // Convert filters to API format
  const apiFilters = useMemo(() => {
    const result: any = {
      page,
      limit,
      sortBy: 'date',
      sortOrder: 'desc'
    };

    if (filters.search) result.search = filters.search;
    if (filters.categoryId && filters.categoryId !== 'all') result.categoryId = filters.categoryId;
    if (filters.type && filters.type !== 'all') result.type = filters.type;
    
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          result.dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          result.dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          result.dateFrom = weekAgo;
          result.dateTo = now;
          break;
        case 'month':
          result.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          result.dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'year':
          result.dateFrom = new Date(now.getFullYear(), 0, 1);
          result.dateTo = new Date(now.getFullYear(), 11, 31);
          break;
      }
    }

    return result;
  }, [page, filters]);

  const { data: transactionsData, isLoading } = useTransactions(apiFilters);

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  return (
    <MainLayout title="Transactions">
      <div className="space-y-6" data-testid="transactions-page">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
            <p className="text-muted-foreground">Manage your income and expenses</p>
          </div>
          {canEdit && (
            <Button onClick={handleAddTransaction} data-testid="button-add-transaction">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          )}
        </div>

        {/* Filters */}
        <TransactionFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Transactions Table */}
        <TransactionTable
          transactions={transactionsData?.transactions || []}
          total={transactionsData?.total || 0}
          page={page}
          limit={limit}
          onPageChange={handlePageChange}
          onEditTransaction={handleEditTransaction}
          isLoading={isLoading}
        />

        {/* Transaction Form Modal */}
        {canEdit && (
          <TransactionForm
            isOpen={isFormOpen}
            onClose={handleCloseForm}
            transaction={editingTransaction}
          />
        )}
      </div>
    </MainLayout>
  );
}
