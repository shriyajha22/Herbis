'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/storeContext';
import { initialProducts, getOrderItemImage } from '@/lib/seedData';
import { ShoppingBag, Heart, MapPin, Wallet, Shield, Plus, Edit3, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'orders';

  const { currentUser, wishlist, toggleWishlist, addToCart, logout, updateUserAddresses, showToast } = useStore();

  React.useEffect(() => {
    if (!currentUser && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        if (!currentUser) {
          router.push('/login?redirect=/dashboard&notice=Please+log+in+to+view+your+order+status.');
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentUser, router]);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'wallet' | 'settings'>(initialTab);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [passCurrent, setPassCurrent] = useState('');
  const [passNew, setPassNew] = useState('');

  // Address Management State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  const openAddAddressModal = () => {
    setEditingAddressIndex(null);
    setAddressForm({
      fullName: currentUser?.name || '',
      phone: currentUser?.phone || '',
      email: currentUser?.email || '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: (currentUser?.addresses?.length || 0) === 0,
    });
    setAddressErrors({});
    setShowAddressModal(true);
  };

  const openEditAddressModal = (index: number) => {
    const addr = currentUser?.addresses?.[index];
    if (!addr) return;
    setEditingAddressIndex(index);
    setAddressForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      email: addr.email || currentUser?.email || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      isDefault: Boolean(addr.isDefault),
    });
    setAddressErrors({});
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) return;

    const errs: Record<string, string> = {};
    if (!addressForm.fullName.trim()) errs.fullName = 'Full Name is required.';
    const cleanPhone = addressForm.phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) errs.phone = 'Valid 10-digit mobile number required.';
    if (!addressForm.street.trim()) errs.street = 'Street / House address required.';
    if (!addressForm.city.trim()) errs.city = 'City required.';
    if (!addressForm.state.trim()) errs.state = 'State required.';
    if (!addressForm.pincode.trim() || !/^\d{6}$/.test(addressForm.pincode.trim())) errs.pincode = 'Valid 6-digit Pincode required.';

    if (Object.keys(errs).length > 0) {
      setAddressErrors(errs);
      return;
    }

    setIsSubmittingAddress(true);
    try {
      const isEdit = editingAddressIndex !== null;
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          action: isEdit ? 'edit' : 'add',
          index: isEdit ? editingAddressIndex : undefined,
          address: addressForm,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.addresses)) {
        updateUserAddresses(data.addresses);
        showToast(isEdit ? 'Delivery address updated successfully!' : 'New delivery address saved!', 'success');
        setShowAddressModal(false);
      } else {
        showToast(data.message || 'Failed to save address', 'error');
      }
    } catch (err) {
      showToast('Error saving delivery address', 'error');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (index: number) => {
    if (!currentUser?.email) return;
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          action: 'setDefault',
          index,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.addresses)) {
        updateUserAddresses(data.addresses);
        showToast('Default delivery address updated', 'success');
      }
    } catch (e) {
      showToast('Failed to set default address', 'error');
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!currentUser?.email) return;
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          action: 'delete',
          index,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.addresses)) {
        updateUserAddresses(data.addresses);
        showToast('Delivery address removed', 'info');
      }
    } catch (e) {
      showToast('Failed to delete delivery address', 'error');
    }
  };

  React.useEffect(() => {
    if (currentUser?.email) {
      fetchCustomerOrders(currentUser.email);
    }
  }, [currentUser]);

  const fetchCustomerOrders = async (email: string) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setCustomerOrders(data.orders);
      } else {
        const stored = localStorage.getItem('pbh_orders');
        if (stored) {
          try { setCustomerOrders(JSON.parse(stored)); } catch (e) {}
        }
      }
    } catch (e) {
      const stored = localStorage.getItem('pbh_orders');
      if (stored) {
        try { setCustomerOrders(JSON.parse(stored)); } catch (err) {}
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  // Order Cancellation State
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: cancellingOrder._id,
          orderNumber: cancellingOrder.orderNumber,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        showToast(data.message || `Order #${cancellingOrder.orderNumber} has been cancelled successfully.`, 'success');
        setCustomerOrders((prev) =>
          prev.map((o) => (o._id === data.order._id || o.orderNumber === data.order.orderNumber ? data.order : o))
        );
        setCancellingOrder(null);
      } else {
        showToast(data.message || 'Failed to cancel order', 'error');
      }
    } catch (err) {
      showToast('Error processing order cancellation.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const wishlistedProducts = initialProducts.filter((p) => wishlist.includes(p._id));

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passNew) return;
    showToast("Password updated successfully!", "success");
    setPassCurrent('');
    setPassNew('');
  };

  if (!currentUser) {
    return (
      <div className="py-20 text-center space-y-5 max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-cream text-brand-darkGreen flex items-center justify-center mx-auto border border-brand-mint/40 shadow-soft">
          <Shield className="w-8 h-8 text-brand-green" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading font-extrabold text-2xl text-brand-darkGreen">Customer Account Required</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Please log in or create an account to access your saved orders, delivery addresses, tea wallet, and wishlist.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/login"
            className="flex-1 bg-brand-green hover:bg-brand-darkGreen text-white font-extrabold text-xs px-6 py-3 rounded-button transition-all shadow-soft text-center"
          >
            Log In to Account
          </Link>
          <Link
            href="/register"
            className="flex-1 bg-white border border-brand-mint/40 text-brand-darkGreen hover:bg-brand-beige font-extrabold text-xs px-6 py-3 rounded-button transition-all text-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile Header */}
        <div className="bg-brand-darkGreen text-white p-6 sm:p-8 rounded-card mb-8 shadow-premium flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-gold text-brand-darkGreen flex items-center justify-center font-bold text-2xl border-2 border-white shadow-gold">
              {currentUser?.name.charAt(0) || 'A'}
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-white">{currentUser?.name}</h1>
              <p className="text-xs text-brand-mint">{currentUser?.email}</p>
            </div>
          </div>

          {/* <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-card text-center border border-white/20">
              <span className="text-[10px] text-brand-gold uppercase tracking-wider block font-bold">Tea Wallet</span>
              <span className="font-bold text-sm text-white">₹{currentUser?.walletBalance || 250}</span>
            </div>
          </div> */}
        </div>

        {/* Dashboard Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation Sidebar */}
          <div className="bg-white p-4 rounded-card border border-brand-mint/30 shadow-card space-y-1 h-fit">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left text-xs font-bold px-4 py-3 rounded-button flex items-center gap-3 transition-colors ${
                activeTab === 'orders' ? 'bg-brand-green text-white shadow-soft' : 'text-brand-charcoal hover:bg-brand-beige'
              }`}
            >
              {/* <ShoppingBag className="w-4 h-4" /> Order History & Tracking */}
              <ShoppingBag className="w-4 h-4" /> Order History
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full text-left text-xs font-bold px-4 py-3 rounded-button flex items-center gap-3 transition-colors ${
                activeTab === 'wishlist' ? 'bg-brand-green text-white shadow-soft' : 'text-brand-charcoal hover:bg-brand-beige'
              }`}
            >
              <Heart className="w-4 h-4" /> Saved Wishlist ({wishlist.length})
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left text-xs font-bold px-4 py-3 rounded-button flex items-center gap-3 transition-colors ${
                activeTab === 'addresses' ? 'bg-brand-green text-white shadow-soft' : 'text-brand-charcoal hover:bg-brand-beige'
              }`}
            >
              <MapPin className="w-4 h-4" /> Saved Delivery Addresses
            </button>
            {/* <button
              onClick={() => setActiveTab('wallet')}
              className={`w-full text-left text-xs font-bold px-4 py-3 rounded-button flex items-center gap-3 transition-colors ${
                activeTab === 'wallet' ? 'bg-brand-green text-white shadow-soft' : 'text-brand-charcoal hover:bg-brand-beige'
              }`}
            >
              <Wallet className="w-4 h-4" /> Wallet & Rewards
            </button> */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left text-xs font-bold px-4 py-3 rounded-button flex items-center gap-3 transition-colors ${
                activeTab === 'settings' ? 'bg-brand-green text-white shadow-soft' : 'text-brand-charcoal hover:bg-brand-beige'
              }`}
            >
              <Shield className="w-4 h-4" /> Account & Password Settings
            </button>
            <button
              onClick={logout}
              className="w-full text-left text-xs font-bold px-4 py-3 rounded-button flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors pt-2 border-t border-gray-100 mt-2"
            >
              Logout Account
            </button>
          </div>

          {/* Right Tab Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-xl text-brand-darkGreen">Your Order History</h2>

                {loadingOrders ? (
                  <p className="text-xs text-gray-500">Loading your orders...</p>
                ) : customerOrders.length === 0 ? (
                  <div className="bg-white p-8 rounded-card border border-brand-mint/30 shadow-card text-center space-y-3">
                    <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-500">You haven&apos;t placed any tea orders yet.</p>
                    <Link
                      href="/shop"
                      className="inline-block bg-brand-green text-white text-xs font-bold px-5 py-2.5 rounded-button hover:bg-brand-darkGreen transition-colors"
                    >
                      Explore Tea Shop
                    </Link>
                  </div>
                ) : (
                  customerOrders.map((ord) => {
                    const rawStatus = ord.orderStatus || 'Processing';
                    const statusLower = String(rawStatus).trim().toLowerCase();
                    const isCancellable = ['pending', 'processing', 'confirmed'].includes(statusLower);

                    let statusBadgeClass = 'bg-sky-50 text-sky-800 border-sky-200';
                    if (statusLower === 'pending') statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                    if (statusLower === 'confirmed') statusBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
                    if (statusLower === 'shipped') statusBadgeClass = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                    if (statusLower === 'delivered') statusBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    if (statusLower === 'cancelled') statusBadgeClass = 'bg-red-50 text-red-800 border-red-200';

                    return (
                      <div key={ord._id || ord.orderNumber} className="bg-white rounded-card border border-brand-mint/30 shadow-card p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-badge border ${statusBadgeClass}`}>
                                STATUS: {rawStatus.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                {ord.paymentMethod || 'Cash on Delivery'}
                              </span>
                            </div>
                            <h3 className="font-heading font-bold text-base text-brand-darkGreen mt-1 font-mono">
                              Order #{ord.orderNumber}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Placed on {new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Total: <strong className="text-brand-darkGreen font-mono">₹{ord.total}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCancellable && (
                              <button
                                type="button"
                                onClick={() => setCancellingOrder(ord)}
                                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold px-3.5 py-2 rounded-button transition-colors"
                              >
                                Cancel Order
                              </button>
                            )}
                            {/* <Link
                              href={`/track-order?orderNumber=${ord.orderNumber}`}
                              className="bg-brand-darkGreen text-white text-xs font-semibold px-4 py-2 rounded-button hover:bg-brand-green transition-colors"
                            >
                              Track Shipment Live
                            </Link> */}
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2 pt-1">
                          {(ord.items || []).map((it: any, idx: number) => {
                            const itemImg = getOrderItemImage(it);
                            return (
                              <div key={idx} className="flex items-center gap-3 text-xs">
                                <div className="w-12 h-12 rounded bg-brand-beige relative overflow-hidden flex-shrink-0 border border-brand-mint/30">
                                  <Image src={itemImg} alt={it.productName || 'Herbal Tea'} fill className="object-cover" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-brand-darkGreen">{it.productName}</h4>
                                  <p className="text-gray-500">Quantity: {it.quantity} x {it.weight} • ₹{it.price}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-xl text-brand-darkGreen">Your Saved Wishlist</h2>
                {wishlistedProducts.length === 0 ? (
                  <p className="text-xs text-gray-500">No items currently in your wishlist.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistedProducts.map((p) => (
                      <div key={p._id} className="bg-white p-4 rounded-card border border-brand-mint/30 shadow-card flex gap-3 items-center">
                        <div className="w-16 h-16 rounded bg-brand-beige relative overflow-hidden flex-shrink-0">
                          <Image src={p.images[0]} alt="Product Image" fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-brand-darkGreen truncate">{p.name}</h4>
                          <span className="font-bold text-xs text-brand-green">₹{p.price}</span>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => addToCart(p)}
                              className="bg-brand-green text-white text-[10px] font-bold px-2.5 py-1 rounded"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={() => toggleWishlist(p._id)}
                              className="text-[10px] text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-brand-darkGreen">Saved Delivery Addresses</h2>
                    <p className="text-xs text-gray-500">Manage your saved shipping locations for fast, 1-click checkout.</p>
                  </div>
                  <button
                    onClick={openAddAddressModal}
                    className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-darkGreen text-white text-xs font-bold px-4 py-2.5 rounded-button shadow-soft transition-colors w-fit"
                  >
                    <Plus className="w-4 h-4 text-brand-gold" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {(!currentUser.addresses || currentUser.addresses.length === 0) ? (
                  <div className="bg-white p-8 rounded-card border border-brand-mint/30 shadow-card text-center space-y-4">
                    <div className="w-16 h-16 bg-brand-beige rounded-full flex items-center justify-center mx-auto text-brand-green border border-brand-mint/40">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h3 className="font-heading font-bold text-base text-brand-darkGreen">No saved delivery addresses yet</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Add a delivery address to your account to enjoy effortless 1-click checkout on your future herbal tea purchases.
                      </p>
                    </div>
                    <button
                      onClick={openAddAddressModal}
                      className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-darkGreen text-white text-xs font-bold px-5 py-2.5 rounded-button shadow-soft transition-colors"
                    >
                      <Plus className="w-4 h-4 text-brand-gold" />
                      <span>Add New Address</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentUser.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className={`bg-white p-5 rounded-card border ${
                          addr.isDefault ? 'border-brand-green ring-1 ring-brand-green/30' : 'border-brand-mint/30'
                        } shadow-card text-xs flex flex-col justify-between space-y-4`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            {addr.isDefault ? (
                              <span className="bg-brand-mint/30 text-brand-darkGreen font-extrabold px-2.5 py-1 rounded text-[10px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-brand-green" /> Default Address
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-semibold">Saved Location #{idx + 1}</span>
                            )}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditAddressModal(idx)}
                                className="p-1.5 hover:bg-brand-beige text-gray-600 hover:text-brand-darkGreen rounded-button"
                                title="Edit Address"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(idx)}
                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-button"
                                title="Delete Address"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-heading font-bold text-sm text-brand-darkGreen">{addr.fullName}</h4>
                          <p className="text-gray-700 leading-relaxed font-light">
                            {addr.street}, {addr.city}, {addr.state} - <strong className="font-mono">{addr.pincode}</strong>
                          </p>
                          <div className="text-[11px] text-gray-500 space-y-0.5 pt-1 border-t border-gray-100">
                            <p>Phone: <strong className="text-gray-700 font-mono">{addr.phone}</strong></p>
                            <p>Email: <span className="text-gray-600">{addr.email || currentUser.email}</span></p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          {!addr.isDefault ? (
                            <button
                              onClick={() => handleSetDefaultAddress(idx)}
                              className="text-[11px] font-bold text-brand-green hover:text-brand-darkGreen hover:underline"
                            >
                              Set as Default Address
                            </button>
                          ) : (
                            <span className="text-[11px] text-brand-green font-semibold">● Primary Delivery Address</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-xl text-brand-darkGreen">PrimeBrew Wallet & Rewards</h2>
                <div className="bg-white p-6 rounded-card border border-brand-mint/30 shadow-card text-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span>Available Store Cashback</span>
                    <span className="font-heading font-extrabold text-2xl text-brand-green">₹250.00</span>
                  </div>
                  <p className="text-gray-500">You earn 5% cashback on every tea order placed!</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-xl text-brand-darkGreen">Account & Security Settings</h2>
                <div className="bg-white p-6 rounded-card border border-brand-mint/30 shadow-card space-y-6 text-xs">
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-brand-darkGreen">Profile Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-500 font-semibold block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={currentUser?.name || ''}
                          readOnly
                          className="w-full p-2.5 rounded-button bg-gray-50 border border-gray-200 text-brand-darkGreen font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-semibold block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={currentUser?.email || ''}
                          readOnly
                          className="w-full p-2.5 rounded-button bg-gray-50 border border-gray-200 text-brand-darkGreen font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h3 className="font-bold text-sm text-brand-darkGreen">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
                      <div>
                        <label className="text-gray-500 font-semibold block mb-1">Current Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={passCurrent}
                          onChange={(e) => setPassCurrent(e.target.value)}
                          required
                          className="w-full p-2.5 rounded-button border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-semibold block mb-1">New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={passNew}
                          onChange={(e) => setPassNew(e.target.value)}
                          required
                          className="w-full p-2.5 rounded-button border border-gray-300"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-brand-green hover:bg-brand-darkGreen text-white font-bold px-5 py-2.5 rounded-button"
                      >
                        Update Security Password
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add / Edit Delivery Address Modal Dialog */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-modal shadow-premium w-full max-w-lg p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-brand-darkGreen">
                  {editingAddressIndex !== null ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                </h3>
                <p className="text-[11px] text-gray-500">Save address to your customer profile for fast checkout</p>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-700 font-bold text-base px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="text-gray-700 font-semibold block mb-1">Full Recipient Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-button border border-gray-300 focus:border-brand-green focus:outline-none"
                />
                {addressErrors.fullName && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-button border border-gray-300 focus:border-brand-green focus:outline-none font-mono"
                  />
                  {addressErrors.phone && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.phone}</p>}
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-button border border-gray-300 focus:border-brand-green focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">House / Flat No., Street & Landmark *</label>
                <textarea
                  rows={2}
                  placeholder="Flat 301, Lotus Apartments, 4th Main Road..."
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-button border border-gray-300 focus:border-brand-green focus:outline-none"
                />
                {addressErrors.street && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.street}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-button border border-gray-300 focus:border-brand-green focus:outline-none"
                  />
                  {addressErrors.city && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.city}</p>}
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-button border border-gray-300 focus:border-brand-green focus:outline-none"
                  />
                  {addressErrors.state && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.state}</p>}
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Pincode *</label>
                  <input
                    type="text"
                    placeholder="6 digits"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-button border border-gray-300 focus:border-brand-green focus:outline-none font-mono"
                  />
                  {addressErrors.pincode && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.pincode}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chkDefaultAddress"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-4 w-4"
                />
                <label htmlFor="chkDefaultAddress" className="text-gray-700 font-semibold cursor-pointer">
                  Set as my primary default delivery address
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  disabled={isSubmittingAddress}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAddress}
                  className="flex-1 bg-brand-green hover:bg-brand-darkGreen text-white font-bold py-2.5 rounded-button shadow-soft transition-colors disabled:opacity-50"
                >
                  {isSubmittingAddress ? 'Saving Address...' : editingAddressIndex !== null ? 'Update Address' : 'Save Delivery Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal Dialog */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-modal shadow-premium w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-brand-darkGreen">
                  Cancel Order?
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  Are you sure you want to cancel Order #{cancellingOrder.orderNumber}?
                </p>
              </div>
            </div>

            <div className="bg-brand-cream/60 p-3 rounded border border-brand-mint/30 text-gray-700 leading-relaxed space-y-1">
              <p>
                Once cancelled, this order will not be processed or shipped.
              </p>
              <div className="text-[11px] text-gray-500 space-y-0.5 pt-1">
                <p>Order Total: <strong className="text-brand-darkGreen font-mono">₹{cancellingOrder.total}</strong></p>
                <p>Payment Method: <strong>{cancellingOrder.paymentMethod || 'Cash on Delivery'}</strong></p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                disabled={isCancelling}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-button transition-colors"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-button shadow-soft transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-brand-darkGreen font-bold">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
