import React, { Suspense } from 'react';
import { Link } from 'wouter';
import MainLayout from '@/components/Layout/MainLayout';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import DashboardCharts from '@/components/Dashboard/DashboardCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTransactions } from '@/hooks/useTransactions';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({ 
    limit: 5, 
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const recentTransactions = transactionsData?.transactions || [];

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6" data-testid="dashboard-page">
        
        {/* Stats Cards */}
        <DashboardStats 
          analytics={analytics || {
            totalBalance: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            savingsRate: 0,
            balanceChange: 0,
            incomeChange: 0,
            expenseChange: 0,
            savingsChange: 0,
            categoryBreakdown: [],
            monthlyTrends: []
          }} 
          isLoading={analyticsLoading} 
        />

        {/* Charts */}
        <DashboardCharts 
          analytics={analytics || {
            totalBalance: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            savingsRate: 0,
            balanceChange: 0,
            incomeChange: 0,
            expenseChange: 0,
            savingsChange: 0,
            categoryBreakdown: [],
            monthlyTrends: []
          }}
          isLoading={analyticsLoading} 
        />

        {/* Recent Transactions */}
        <Card data-testid="recent-transactions">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" data-testid="button-view-all-transactions">
                  View all <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-0" data-testid={`recent-transaction-${transaction.id}`}>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: `${transaction.category.color}20`,
                          color: transaction.category.color
                        }}
                      >
                        <i className={`${transaction.category.icon} text-sm`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-foreground" data-testid="recent-transaction-description">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {transaction.category.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold font-mono ${
                        transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`} data-testid="recent-transaction-amount">
                        {transaction.type === 'income' ? '+' : '-'}₹{Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), 'MMM dd, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="no-recent-transactions">
                <p>No recent transactions</p>
                <Link href="/transactions">
                  <Button variant="link" className="mt-2">Add your first transaction</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
