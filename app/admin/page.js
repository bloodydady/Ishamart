'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, getRecentOrders } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiTrendingUp } from 'react-icons/fi';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(5)
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.orders || []);
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  // Chart Data Preparation
  const salesData = {
    labels: stats?.last7Days?.labels || [],
    datasets: [
      {
        label: 'Sales (₹)',
        data: stats?.last7Days?.sales || [],
        borderColor: '#1a237e',
        backgroundColor: 'rgba(26, 35, 126, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const ordersData = {
    labels: stats?.last7Days?.labels || [],
    datasets: [
      {
        label: 'Orders Count',
        data: stats?.last7Days?.orders || [],
        backgroundColor: '#ff6f00',
        borderRadius: 4,
      }
    ]
  };

  const statusData = {
    labels: Object.keys(stats?.ordersByStatus || {}).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: Object.values(stats?.ordersByStatus || {}),
        backgroundColor: [
          '#fbbf24', // pending - yellow
          '#60a5fa', // confirmed - blue
          '#a78bfa', // shipped - purple
          '#34d399', // delivered - green
          '#f87171', // cancelled - red
        ],
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
          <FiTrendingUp /> Generate Report
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-2xl">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatPrice(stats?.totalRevenue || 0)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-[var(--color-secondary)]">
          <div className="w-14 h-14 rounded-xl bg-orange-50 text-[var(--color-secondary)] flex items-center justify-center text-2xl">
            <FiShoppingBag />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
            <FiUsers />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-[var(--color-primary)]">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-[var(--color-primary)] flex items-center justify-center text-2xl">
            <FiBox />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue (Last 7 Days)</h3>
          <div className="h-72">
            <Line data={salesData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Orders (Last 7 Days)</h3>
          <div className="h-72">
            <Bar data={ordersData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Doughnut */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status Distribution</h3>
          <div className="h-64 flex justify-center">
            {Object.keys(stats?.ordersByStatus || {}).length > 0 ? (
              <Doughnut data={statusData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <a href="/admin/orders" className="text-sm font-medium text-[var(--color-primary)] hover:underline">View All</a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">No recent orders found.</td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{order.id.substring(0, 8).toUpperCase()}...</td>
                      <td className="p-4 text-gray-600">{order.userName}</td>
                      <td className="p-4 font-bold text-gray-900">{formatPrice(order.totalAmount)}</td>
                      <td className="p-4">
                        <OrderStatusBadge status={order.status} deliveryType={order.deliveryType} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
