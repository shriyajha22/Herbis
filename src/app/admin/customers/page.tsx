'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Eye, Trash2, Mail, Phone, Wallet, RefreshCw } from 'lucide-react';
import { Badge, Modal } from '@/components/shared';
import { useStore } from '@/lib/storeContext';

export default function AdminCustomersPage() {
  const { showToast } = useStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      }
    } catch (e) {
      console.error('Failed to fetch customers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDeleteCustomer = async (cust: any) => {
    if (!window.confirm(`Are you sure you want to delete customer account "${cust.name}" (${cust.email})?`)) return;

    try {
      const res = await fetch(`/api/admin/customers/${cust._id || cust.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Customer account deleted', 'info');
        setCustomers((prev) => prev.filter((c) => (c._id || c.id) !== (cust._id || cust.id)));
        if (selectedCustomer && (selectedCustomer._id || selectedCustomer.id) === (cust._id || cust.id)) {
          setSelectedCustomer(null);
        }
      } else {
        showToast(data.message || 'Failed to delete customer', 'error');
      }
    } catch (e) {
      showToast('Error deleting customer', 'error');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-darkGreen tracking-tight">
            Customer Management
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Registered customer accounts, contact details, wallets and saved addresses
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="px-3.5 py-2 bg-white text-gray-700 font-bold text-xs rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:bg-white focus:border-brand-green outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 font-bold">Customer Name</th>
                <th className="py-3.5 px-4 font-bold">Email</th>
                <th className="py-3.5 px-4 font-bold">Phone</th>
                <th className="py-3.5 px-4 font-bold">Wallet Balance</th>
                <th className="py-3.5 px-4 font-bold">Role</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust._id || cust.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-cream text-brand-darkGreen font-bold flex items-center justify-center shrink-0">
                          {cust.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{cust.name || 'Unnamed'}</p>
                          <p className="text-[10px] text-gray-400">
                            Joined: {new Date(cust.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-600">{cust.email}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-600">{cust.phone || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        ₹{cust.walletBalance || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={cust.role === 'admin' ? 'gold' : 'neutral'}>
                        {cust.role || 'customer'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="p-1.5 bg-gray-100 hover:bg-brand-cream text-brand-darkGreen rounded-xl transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {cust.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteCustomer(cust)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer Profile: ${selectedCustomer.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Full Name</span>
                <span className="font-bold text-gray-800">{selectedCustomer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email Address</span>
                <span className="font-bold text-gray-800">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone Number</span>
                <span className="font-bold text-gray-800">{selectedCustomer.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wallet Balance</span>
                <span className="font-bold text-emerald-600">
                  ₹{selectedCustomer.walletBalance || 0}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-brand-darkGreen uppercase tracking-wider mb-2">
                Saved Delivery Addresses ({selectedCustomer.addresses?.length || 0})
              </h4>
              {selectedCustomer.addresses?.length === 0 ? (
                <p className="text-gray-400 italic">No delivery addresses saved yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.addresses?.map((addr: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-brand-cream/30 border border-brand-mint/30 rounded-xl"
                    >
                      <p className="font-bold text-gray-800">{addr.fullName}</p>
                      <p className="text-gray-600">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-gray-400 text-[10px]">📞 {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
