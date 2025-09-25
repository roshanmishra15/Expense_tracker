import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--muted))',
  ];

  const chartData = {
    labels: data.map(d => d.category),
    datasets: [{
      data: data.map(d => d.amount),
      backgroundColor: colors.slice(0, data.length),
      borderColor: 'hsl(var(--background))',
      borderWidth: 2,
    }]
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
          color: 'hsl(var(--foreground))',
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0];
                const amount = dataset.data[i];
                const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                const percentage = ((amount / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.backgroundColor[i],
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'hsl(var(--card))',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
  };

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground" data-testid="category-chart-empty">
        No expense data available
      </div>
    );
  }

  return (
    <div data-testid="category-chart">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
