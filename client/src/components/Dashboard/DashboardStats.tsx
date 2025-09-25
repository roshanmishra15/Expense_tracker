import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AnalyticsData } from '@/types';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUp, ArrowDown } from 'lucide-react';

interface DashboardStatsProps {
  analytics: AnalyticsData;
  isLoading?: boolean;
}

export default function DashboardStats({ analytics, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="dashboard-stats-loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Balance',
      value: `$${analytics.totalBalance.toLocaleString()}`,
      change: analytics.balanceChange,
      icon: Wallet,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      testId: 'stat-total-balance'
    },
    {
      title: 'Monthly Income',
      value: `$${analytics.monthlyIncome.toLocaleString()}`,
      change: analytics.incomeChange,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      testId: 'stat-monthly-income'
    },
    {
      title: 'Monthly Expenses',
      value: `$${analytics.monthlyExpenses.toLocaleString()}`,
      change: analytics.expenseChange,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      testId: 'stat-monthly-expenses'
    },
    {
      title: 'Savings Rate',
      value: `${analytics.savingsRate.toFixed(1)}%`,
      change: analytics.savingsChange,
      icon: PiggyBank,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      testId: 'stat-savings-rate'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="dashboard-stats">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.change >= 0;
        const ChangeIcon = isPositive ? ArrowUp : ArrowDown;
        const changeColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

        return (
          <Card key={index} data-testid={stat.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground font-mono" data-testid={`${stat.testId}-value`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ChangeIcon className={`w-4 h-4 ${changeColor} mr-1`} />
                <span className={`${changeColor} font-medium`} data-testid={`${stat.testId}-change`}>
                  {Math.abs(stat.change).toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
