'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Badge, Modal, Button } from '@/components/shared';
import { useStore } from '@/lib/storeContext';

export default function AdminOrdersPage() {
  const { showToast } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Failed to fetch admin orders:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, orderStatus: newStatus }));
        }
      } else {
        showToast(data.message || 'Failed to update order status', 'error');
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const statuses = [
    'All',
    'Pending',
    'Processing',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const filteredOrders = orders.filter((o) => {
    const currentStatus = o.orderStatus || o.status || 'Processing';
    const matchesStatus = statusFilter === 'All' || currentStatus.toLowerCase() === statusFilter.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
      o.shippingAddress?.email?.toLowerCase().includes(q) ||
      o.shippingAddress?.phone?.includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-darkGreen tracking-tight">
            Orders & Logistics
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Track and manage all customer shipments and order statuses
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 bg-white text-gray-700 font-bold text-xs rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:bg-white focus:border-brand-green outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-brand-green text-white shadow-soft'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 font-bold">Order #</th>
                <th className="py-3.5 px-4 font-bold">Customer</th>
                <th className="py-3.5 px-4 font-bold">Items</th>
                <th className="py-3.5 px-4 font-bold">Total</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Change Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const currentStatus = ord.orderStatus || ord.status || 'Processing';
                  return (
                    <tr key={ord._id || ord.orderNumber} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-brand-darkGreen">
                          {ord.orderNumber}
                        </span>
                        <p className="text-[10px] text-gray-400">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-800">
                          {ord.shippingAddress?.fullName || 'Customer'}
                        </p>
                        <p className="text-[10px] text-gray-400">{ord.shippingAddress?.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-gray-600">
                          {ord.items?.length || 0} product(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-brand-darkGreen">
                          ₹{ord.total?.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[10px] text-gray-400">{ord.paymentMethod || 'COD'}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            currentStatus === 'Delivered'
                              ? 'success'
                              : currentStatus === 'Cancelled'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {currentStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={currentStatus}
                          disabled={updatingOrderId === ord._id}
                          onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                          className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium outline-none focus:border-brand-green"
                        >
                          {statuses.filter((s) => s !== 'All').map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-brand-cream text-brand-darkGreen font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details: ${selectedOrder.orderNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Status & Timing */}
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                <p className="font-extrabold text-brand-darkGreen text-sm">
                  {selectedOrder.orderStatus || selectedOrder.status || 'Processing'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Placed On</span>
                <p className="font-semibold text-gray-700">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Courier</span>
                <p className="font-semibold text-gray-700">
                  {selectedOrder.courierName || 'Shiprocket Express'}
                </p>
              </div>
            </div>

            {/* Customer & Shipping Address */}
            <div>
              <h4 className="font-bold text-brand-darkGreen uppercase tracking-wider mb-2">
                Shipping Address
              </h4>
              <div className="bg-brand-cream/30 p-4 rounded-2xl border border-brand-mint/30 space-y-1">
                <p className="font-bold text-gray-900">
                  {selectedOrder.shippingAddress?.fullName}
                </p>
                <p className="text-gray-600">{selectedOrder.shippingAddress?.street}</p>
                <p className="text-gray-600">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{' '}
                  {selectedOrder.shippingAddress?.pincode}
                </p>
                <p className="text-gray-500 pt-1">
                  📞 {selectedOrder.shippingAddress?.phone} | ✉️{' '}
                  {selectedOrder.shippingAddress?.email}
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            <div>
              <h4 className="font-bold text-brand-darkGreen uppercase tracking-wider mb-2">
                Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">
                        {item.productName || item.name || 'Herbal Tea'}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Qty: {item.quantity} | {item.weight || 'Standard'}
                      </p>
                    </div>
                    <span className="font-extrabold text-brand-darkGreen">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-2xl space-y-1.5 text-right font-medium">
              <p className="text-gray-500">
                Subtotal: ₹{selectedOrder.subtotal?.toLocaleString('en-IN')}
              </p>
              {selectedOrder.discount > 0 && (
                <p className="text-emerald-600">
                  Discount: -₹{selectedOrder.discount?.toLocaleString('en-IN')}
                </p>
              )}
              <p className="text-gray-500">
                Shipping: {selectedOrder.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.shippingFee}`}
              </p>
              <p className="text-gray-500">Tax (5% GST): ₹{selectedOrder.tax}</p>
              <div className="border-t border-gray-200 pt-2">
                <p className="font-black text-brand-darkGreen text-sm">
                  Total: ₹{selectedOrder.total?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
