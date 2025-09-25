import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface IncomeExpenseChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: data.map(d => d.income),
        borderColor: 'hsl(var(--chart-2))',
        backgroundColor: 'hsl(var(--chart-2) / 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: data.map(d => d.expenses),
        borderColor: 'hsl(var(--destructive))',
        backgroundColor: 'hsl(var(--destructive) / 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          color: 'hsl(var(--foreground))'
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'hsl(var(--card))',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'hsl(var(--border))',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'hsl(var(--border))',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div data-testid="income-expense-chart">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
