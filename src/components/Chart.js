import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const LineChart = ({ chartData, currency = 'USD', theme = 'light' }) => {
  const dark = theme === 'dark';
  const textColor = dark ? '#c7d2e4' : '#334155';
  const gridColor = dark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(51, 65, 85, 0.12)';
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: dark ? '#17243a' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: dark ? '#334766' : '#dbe2ec',
        borderWidth: 1,
      },
    },
    elements: { point: { radius: 1, hitRadius: 8 } },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
        title: { display: true, text: 'Date', color: textColor },
      },
      y: {
        ticks: {
          color: textColor,
          callback: value => new Intl.NumberFormat('en-KE', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value),
        },
        grid: { color: gridColor },
        title: { display: true, text: `Price (${currency})`, color: textColor },
      },
    },
  };
  return <Line data={chartData} options={options} />;
};

export default LineChart;
