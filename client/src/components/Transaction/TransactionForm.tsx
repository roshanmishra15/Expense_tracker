import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery } from '@tanstack/react-query';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Category, TransactionWithCategory } from '@/types';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: TransactionWithCategory;
}

export default function TransactionForm({ isOpen, onClose, transaction }: TransactionFormProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async (): Promise<Category[]> => {
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    enabled: !!token
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      description: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0]
    }
  });

  const selectedType = watch('type');
  const filteredCategories = categories.filter(cat => cat.type === selectedType);

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        categoryId: transaction.categoryId,
        date: new Date(transaction.date).toISOString().split('T')[0]
      });
    } else {
      reset({
        type: 'expense',
        amount: 0,
        description: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [transaction, reset]);

  // Reset category when type changes
  useEffect(() => {
    setValue('categoryId', '');
  }, [selectedType, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const payload = {
        ...data,
        amount: Number.isFinite(data.amount) ? Number(data.amount) : 0,
        date: new Date(data.date).toISOString().split('T')[0],
      };
      if (transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          data: payload
        });
        toast({
          title: "Success",
          description: "Transaction updated successfully!"
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast({
          title: "Success", 
          description: "Transaction created successfully!"
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save transaction",
        variant: "destructive"
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="transaction-form-dialog">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup
              value={selectedType}
              onValueChange={(value) => setValue('type', value as 'income' | 'expense')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" data-testid="radio-expense" />
                <Label htmlFor="expense">Expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" data-testid="radio-income" />
                <Label htmlFor="income">Income</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8"
                data-testid="input-amount"
                {...register('amount', { valueAsNumber: true })}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive" data-testid="error-amount">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description..."
              data-testid="input-description"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive" data-testid="error-description">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch('categoryId')}
              onValueChange={(value) => setValue('categoryId', value)}
            >
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <i className={category.icon} style={{ color: category.color }}></i>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive" data-testid="error-category">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              data-testid="input-date"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-destructive" data-testid="error-date">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              data-testid="button-save"
            >
              {isLoading ? 'Saving...' : (transaction ? 'Update' : 'Add')} Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
