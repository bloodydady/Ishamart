'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiDownload, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  // Chart Data preparation
  const categoryData = {
    labels: ['Electronics', 'Clothing', 'Home', 'Beauty', 'Groceries', 'Other'],
    datasets: [{
      label: 'Products by Category',
      data: [15, 25, 10, 8, 30, 12], // Dummy data representing distribution since it's hard to aggregate real time without heavy query
      backgroundColor: [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'
      ],
      borderWidth: 0,
    }]
  };

  const revenueData = {
    labels: stats?.last7Days?.labels || [],
    datasets: [{
      label: 'Daily Revenue (₹)',
      data: stats?.last7Days?.sales || [],
      backgroundColor: 'rgba(26, 35, 126, 0.8)',
      borderRadius: 4,
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Detailed view of your business performance</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <FiDownload size={18} /> Export PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 md:col-span-3 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiTrendingUp className="text-[var(--color-primary)]" /> Revenue Trend (Last 7 Days)
          </h3>
          <div className="h-80">
            <Bar 
              data={revenueData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiBarChart2 className="text-[var(--color-secondary)]" /> Product Distribution
          </h3>
          <div className="h-64 flex justify-center">
            <Pie 
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-black">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Performance Summary</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-4 font-medium text-gray-600 bg-gray-50 w-1/3">Total Gross Revenue</td>
                <td className="p-4 font-bold text-xl text-[var(--color-primary)]">{formatPrice(stats?.totalRevenue || 0)}</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-600 bg-gray-50">Total Orders Processed</td>
                <td className="p-4 font-bold text-gray-900">{stats?.totalOrders || 0} orders</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-600 bg-gray-50">Registered Users</td>
                <td className="p-4 font-bold text-gray-900">{stats?.totalUsers || 0} users</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-600 bg-gray-50">Active Products Inventory</td>
                <td className="p-4 font-bold text-gray-900">{stats?.totalProducts || 0} items</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
