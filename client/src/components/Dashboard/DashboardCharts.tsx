import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsData } from '@/types';

// Lazy load chart components
const IncomeExpenseChart = React.lazy(() => import('@/components/Charts/IncomeExpenseChart'));
const CategoryChart = React.lazy(() => import('@/components/Charts/CategoryChart'));

interface DashboardChartsProps {
  analytics: AnalyticsData;
  isLoading?: boolean;
}

function ChartSkeleton() {
  return (
    <div className="h-[300px] bg-muted animate-pulse rounded" />
  );
}

export default function DashboardCharts({ analytics, isLoading }: DashboardChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="dashboard-charts-loading">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <ChartSkeleton />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <ChartSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="dashboard-charts">
      {/* Income vs Expenses Chart */}
      <Card data-testid="income-expense-chart-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Income vs Expenses</CardTitle>
            <Select defaultValue="6months">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Suspense fallback={<ChartSkeleton />}>
              <IncomeExpenseChart data={analytics.monthlyTrends} />
            </Suspense>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution Chart */}
      <Card data-testid="category-chart-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Expense Categories</CardTitle>
            <Select defaultValue="month">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="lastmonth">Last month</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Suspense fallback={<ChartSkeleton />}>
              <CategoryChart data={analytics.categoryBreakdown} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
