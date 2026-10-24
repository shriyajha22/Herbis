'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  Activity,
  Truck,
  AlertTriangle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/shared';

export default function AdminDashboardOverviewPage() {
  const [kpis, setKpis] = useState<any>({
    currentlyOnline: 0,
    todaysOrders: 0,
    pendingOrders: 0,
    ordersInDelivery: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    todaysRevenue: 0,
    totalRevenue: 0,
  });
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/live');
        const data = await res.json();
        if (!isMounted) return;
        if (data.success) {
          if (data.kpis) setKpis(data.kpis);
          if (Array.isArray(data.activeSessions)) setActiveSessions(data.activeSessions);
          if (Array.isArray(data.orders)) {
            setRecentOrders(data.orders.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-darkGreen tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Real-time sales performance, active visitors & order health
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-brand-green text-white font-bold text-xs rounded-xl shadow-soft hover:bg-brand-darkGreen transition-colors flex items-center gap-2"
          >
            <span>Manage Orders</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-darkGreen">
            ₹{kpis.totalRevenue?.toLocaleString('en-IN') || 0}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">
            Today: ₹{kpis.todaysRevenue?.toLocaleString('en-IN') || 0}
          </p>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Today&apos;s Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-darkGreen">
            {kpis.todaysOrders || 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">
            {kpis.completedOrders || 0} delivered
          </p>
        </div>

        {/* Pending Processing */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-darkGreen">
            {kpis.pendingOrders || 0}
          </p>
          <p className="text-[11px] text-blue-600 font-medium">
            {kpis.ordersInDelivery || 0} out for delivery
          </p>
        </div>

        {/* Live Visitors */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Live Visitors
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black text-brand-darkGreen">
              {kpis.currentlyOnline || activeSessions.length || 0}
            </p>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-gray-400 font-medium">Active storefront sessions</p>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-brand-darkGreen">Recent Orders</h2>
              <p className="text-xs text-gray-400">Latest customer transactions</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No recent orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord._id || ord.orderNumber} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-brand-darkGreen">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-800">
                          {ord.shippingAddress?.fullName || ord.customerName || 'Customer'}
                        </p>
                        <p className="text-[10px] text-gray-400">{ord.shippingAddress?.city}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-darkGreen">
                        ₹{ord.total?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            ord.orderStatus === 'Delivered'
                              ? 'success'
                              : ord.orderStatus === 'Cancelled'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {ord.orderStatus || ord.status || 'Processing'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Visitor Sessions (1 col) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-brand-darkGreen">Live Activity</h2>
              <p className="text-xs text-gray-400">Current active sessions</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </span>
          </div>

          <div className="space-y-3">
            {activeSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No active storefront sessions detected.
              </div>
            ) : (
              activeSessions.slice(0, 6).map((session, i) => (
                <div
                  key={session.id || i}
                  className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">
                      {session.userName || session.email || 'Guest Visitor'}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      Path: {session.lastPath || '/'}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {session.lastActive
                      ? new Date(session.lastActive).toLocaleTimeString([], {
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : 'Just now'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
