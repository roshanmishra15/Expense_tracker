import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { TransactionWithCategory } from '@/types';
import { Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: TransactionWithCategory[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEditTransaction: (transaction: TransactionWithCategory) => void;
  isLoading?: boolean;
}

export default function TransactionTable({
  transactions,
  total,
  page,
  limit,
  onPageChange,
  onEditTransaction,
  isLoading = false
}: TransactionTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const deleteMutation = useDeleteTransaction();
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const canEdit = user?.role !== 'read-only';
  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Transaction deleted successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };

  const handleSort = (column: 'date' | 'amount') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let aVal, bVal;
      
      if (sortBy === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      } else {
        aVal = parseFloat(a.amount);
        bVal = parseFloat(b.amount);
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [transactions, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <Card data-testid="transaction-table-loading">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="transaction-table">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('date')}
                    className="h-auto p-0 font-medium"
                    data-testid="sort-date"
                  >
                    Date
                    <ArrowUpDown className="ml-1 w-3 h-3" />
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('amount')}
                    className="h-auto p-0 font-medium"
                    data-testid="sort-amount"
                  >
                    Amount
                    <ArrowUpDown className="ml-1 w-3 h-3" />
                  </Button>
                </TableHead>
                {canEdit && <TableHead className="w-[100px] text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 5 : 4} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50" data-testid={`transaction-row-${transaction.id}`}>
                    <TableCell className="font-medium">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ 
                            backgroundColor: `${transaction.category.color}20`,
                            color: transaction.category.color
                          }}
                        >
                          <i className={`${transaction.category.icon} text-xs`}></i>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate" data-testid="transaction-description">
                            {transaction.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.type === 'income' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {transaction.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      <span 
                        className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                        data-testid="transaction-amount"
                      >
                        {transaction.type === 'income' ? '+' : '-'}₹{Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </span>
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditTransaction(transaction)}
                            className="h-8 w-8 p-0 text-primary hover:text-primary/80"
                            data-testid={`button-edit-${transaction.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            disabled={deleteMutation.isPending}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                            data-testid={`button-delete-${transaction.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className="w-8 h-8 p-0"
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                data-testid="button-next-page"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
