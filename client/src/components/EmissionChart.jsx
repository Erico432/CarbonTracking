// client/src/components/EmissionChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EmissionChart = ({ stats }) => {
  const categoryData = {
    labels: stats.categoryBreakdown.map(cat => 
      cat._id.charAt(0).toUpperCase() + cat._id.slice(1)
    ),
    datasets: [
      {
        label: 'CO₂ Emissions (kg)',
        data: stats.categoryBreakdown.map(cat => cat.totalEmissions),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyData = {
    labels: stats.monthlyTrend.map(month => 
      `${month._id.year}-${String(month._id.month).padStart(2, '0')}`
    ),
    datasets: [
      {
        label: 'Monthly Emissions (kg CO₂)',
        data: stats.monthlyTrend.map(month => month.totalEmissions),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="h-64">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Emissions by Category
        </h3>
        <Pie data={categoryData} options={{ maintainAspectRatio: false }} />
      </div>
      <div className="h-64">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Monthly Trend
        </h3>
        <Bar data={monthlyData} options={options} />
      </div>
    </div>
  );
};

export default EmissionChart;
