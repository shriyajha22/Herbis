'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useStore } from '@/lib/storeContext';
import { getOrderItemImage } from '@/lib/seedData';
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  Download,
  AlertCircle,
  ArrowRight,
  MapPin,
  FileText,
  XCircle,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, showToast } = useStore();

  const orderId = searchParams.get('orderId') || '';
  const orderNumberParam = searchParams.get('orderNumber') || '';

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Cancel order modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');

    const target = orderId || orderNumberParam;

    // First try fetching from API if orderId present
    if (target) {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(target)}`);
        const data = await res.json();
        if (res.ok && data.success && data.order) {
          setOrder(data.order);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    // Fallback: search localStorage
    try {
      const stored = localStorage.getItem('pbh_orders');
      if (stored) {
        const ordersArr = JSON.parse(stored);
        const match = ordersArr.find(
          (o: any) =>
            o._id === target ||
            (o.orderNumber && target && o.orderNumber.toLowerCase() === target.toLowerCase())
        );
        if (match) {
          setOrder(match);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    // Fallback 2: if currentUser logged in, check user's orders
    if (currentUser?.email) {
      try {
        const res = await fetch(`/api/orders?email=${encodeURIComponent(currentUser.email)}`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          const match = target
            ? data.orders.find(
                (o: any) => o._id === target || o.orderNumber?.toLowerCase() === target.toLowerCase()
              )
            : data.orders[0];
          if (match) {
            setOrder(match);
            setLoading(false);
            return;
          }
          setOrder(data.orders[0]);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    setLoading(false);
    if (!order) {
      setErrorMsg('Order details not found. Please check your order history.');
    }
  }, [orderId, orderNumberParam, currentUser?.email]);

  useEffect(() => {
    fetchOrderDetails();
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  }, [fetchOrderDetails]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);

    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          orderNumber: order.orderNumber,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.order) {
        setOrder(data.order);
        setShowCancelModal(false);
        showToast(
          data.message || `Order #${order.orderNumber} has been cancelled successfully.`,
          'success'
        );

        // Update local storage backup
        try {
          const stored = localStorage.getItem('pbh_orders');
          if (stored) {
            const arr = JSON.parse(stored);
            const updatedArr = arr.map((o: any) =>
              o._id === data.order._id || o.orderNumber === data.order.orderNumber ? data.order : o
            );
            localStorage.setItem('pbh_orders', JSON.stringify(updatedArr));
          }
        } catch (e) {}
      } else {
        showToast(data.message || 'Failed to cancel order. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Server connection error. Please try again.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 bg-brand-cream min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-brand-green animate-spin mx-auto" />
          <p className="text-xs text-gray-600 font-semibold">Loading your order confirmation...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="py-16 bg-brand-cream min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-card border border-brand-mint/40 shadow-premium p-8 max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-brand-darkGreen">Order Record Not Found</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              We couldn&apos;t find an active order matching this reference. If you recently placed an order, you can view your full order history in your account dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/dashboard?tab=orders"
              className="flex-1 bg-brand-darkGreen hover:bg-brand-green text-white font-extrabold text-xs px-6 py-3.5 rounded-button shadow-soft transition-all text-center"
            >
              View Order History
            </Link>
            <Link
              href="/shop"
              className="flex-1 bg-brand-beige text-brand-darkGreen hover:bg-brand-mint/30 font-extrabold text-xs px-6 py-3.5 rounded-button border border-brand-mint/40 transition-all text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rawStatus = order.orderStatus || 'Processing';
  const statusLower = String(rawStatus).trim().toLowerCase();
  const isCancelled = statusLower === 'cancelled';
  const isCancellable = ['pending', 'processing', 'confirmed'].includes(statusLower);

  // Logistics tracking steps
  const steps = [
    { label: 'Order Placed', key: 'pending', done: true },
    { label: 'Confirmed', key: 'confirmed', done: ['confirmed', 'processing', 'packed', 'shipped', 'delivered'].includes(statusLower) },
    { label: 'Processing', key: 'processing', done: ['processing', 'packed', 'shipped', 'delivered'].includes(statusLower) },
    { label: 'Packed', key: 'packed', done: ['packed', 'shipped', 'delivered'].includes(statusLower) },
    { label: 'Shipped', key: 'shipped', done: ['shipped', 'delivered'].includes(statusLower) },
    { label: 'Out for Delivery', key: 'out for delivery', done: ['out for delivery', 'delivered'].includes(statusLower) },
    { label: 'Delivered', key: 'delivered', done: statusLower === 'delivered' },
  ];

  return (
    <div className="py-12 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Status Card */}
        <div className={`bg-white rounded-card border shadow-premium p-8 text-center space-y-4 ${
          isCancelled ? 'border-red-200' : 'border-brand-mint/30'
        }`}>
          {isCancelled ? (
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
              <XCircle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto border border-sky-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          )}

          <div className="space-y-1">
            {isCancelled ? (
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-3.5 py-1 rounded-badge">
                ❌ Order Cancelled ({order.cancelledBy || 'Customer'})
              </span>
            ) : (
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-badge">
                Order Confirmed (Cash on Delivery)
              </span>
            )}
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-brand-darkGreen pt-1">
              {isCancelled ? 'This order was cancelled' : 'Thank you! Your order has been placed successfully.'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 pt-1">
              Order Reference: <strong className="text-brand-darkGreen font-mono">{order.orderNumber}</strong> • Placed on:{' '}
              <strong className="text-brand-darkGreen">
                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </strong>
            </p>
          </div>

          {/* Action Buttons Bar */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3 text-xs">
            {/* <Link
              href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}
              className="bg-brand-darkGreen hover:bg-brand-green text-white font-extrabold px-5 py-2.5 rounded-button shadow-soft flex items-center gap-2 transition-all"
            >
              <Truck className="w-4 h-4 text-brand-gold" />
              <span>Track Order Status Live</span>
            </Link> */}

            <button
              onClick={handlePrintInvoice}
              className="bg-brand-beige hover:bg-brand-mint/30 text-brand-darkGreen border border-brand-mint/40 font-bold px-4 py-2.5 rounded-button flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-brand-green" />
              <span>Print / Download Tax Invoice</span>
            </button>

            {isCancellable && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-4 py-2.5 rounded-button flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Cancel This Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Tracking Progress Stepper (If not cancelled) */}
        {!isCancelled && (
          <div className="bg-white rounded-card border border-brand-mint/30 shadow-card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading font-bold text-base text-brand-darkGreen flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-green" /> Live Fulfillment & Delivery Tracker
              </h3>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-badge">
                Est. Delivery: {order.estimatedDelivery || '3-4 Business Days'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 text-center text-xs">
              {steps.map((st, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-card border transition-all ${
                    st.done
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold shadow-soft'
                      : 'bg-gray-50 border-gray-200 text-gray-400 font-medium'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-extrabold ${
                      st.done ? 'bg-emerald-500 text-white shadow-soft' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {st.done ? '✓' : idx + 1}
                  </div>
                  <span className="block text-[11px] leading-tight">{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Tax Invoice & Order Breakdown */}
        <div className="bg-white rounded-card border border-brand-mint/30 shadow-card p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-card border border-gray-200 shadow-soft max-w-[140px]">
                <Image
                  src="/images/logo.png"
                  alt="PrimeBrew Herbis Logo"
                  width={130}
                  height={38}
                  className="w-full h-auto object-contain"
                />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-brand-darkGreen">Invoice</h3>
                <p className="text-xs text-gray-500">Farm to Cup. Nature in Every Sip.</p>
              </div>
            </div>

            <div className="text-right text-xs text-gray-600">
              <p>Invoice No: <strong className="font-mono text-brand-darkGreen">{order.orderNumber}</strong></p>
              <p>Payment: <strong className="text-amber-800 font-bold">{order.paymentMethod || 'Cash on Delivery'}</strong></p>
              <p>Status: <strong className="text-emerald-700 font-bold">{order.paymentStatus || 'Pending on Delivery'}</strong></p>
            </div>
          </div>

          {/* Customer & Courier Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-700 bg-brand-beige p-5 rounded-card border border-brand-mint/30">
            <div className="space-y-1">
              <h4 className="font-bold text-brand-darkGreen text-sm border-b border-brand-mint/30 pb-1 mb-2">
                Shipping & Customer Details
              </h4>
              <p className="font-bold text-gray-900">{order.shippingAddress?.fullName || 'Customer'}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong className="font-mono">{order.shippingAddress?.pincode}</strong>
              </p>
              <p>Phone: <span className="font-mono font-semibold text-gray-900">{order.shippingAddress?.phone}</span></p>
              <p>Email: <span className="text-gray-900">{order.shippingAddress?.email}</span></p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-brand-darkGreen text-sm border-b border-brand-mint/30 pb-1 mb-2">
                Logistics & Dispatch Info
              </h4>
              <p>Order Status: <strong className="text-sky-700 font-bold">{order.orderStatus}</strong></p>
              {/* <p>Courier Partner: <strong>{order.courierName || 'Shiprocket Express'}</strong></p> */}
              {/* <p>AWB Tracking No: <strong className="font-mono text-brand-green">{order.trackingNumber || 'SR-884920194'}</strong></p> */}
              <p>Estimated Delivery: <strong>{order.estimatedDelivery || '3-4 Business Days'}</strong></p>
            </div>
          </div>

          {order.gstInvoice && (
            <div className="bg-sky-50 p-3 rounded-card border border-sky-200 text-sky-900 text-xs">
              <p className="font-bold text-sky-950">GST B2B Invoice Issued:</p>
              <p>Company: {order.gstInvoice.companyName} | GSTIN: {order.gstInvoice.gstin}</p>
            </div>
          )}

          {/* Ordered Items Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-brand-darkGreen text-sm border-b border-gray-100 pb-2">
              Purchased Herbal Teas ({(order.items || []).length} items)
            </h4>

            <div className="space-y-2">
              {(order.items || []).map((it: any, i: number) => {
                const itemImg = getOrderItemImage(it);
                return (
                  <div key={i} className="flex justify-between items-center text-xs bg-white p-3 rounded-card border border-gray-100 hover:border-brand-mint/40">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded overflow-hidden bg-brand-beige flex-shrink-0 border border-gray-200">
                        <Image src={itemImg} alt={it.productName || 'Herbal Tea'} fill className="object-cover" />
                      </div>
                      <div>
                        <h5 className="font-bold text-brand-darkGreen">{it.productName}</h5>
                        <p className="text-gray-500 text-[11px]">Variant: {it.weight} • Quantity: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-brand-darkGreen text-sm font-mono">₹{it.price * it.quantity}</span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1 text-xs text-gray-600 pt-3 border-t border-gray-200 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span>₹{order.tax}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-sky-600">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-brand-green font-semibold">
                  <span>Discount Savings</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm text-brand-darkGreen pt-2 border-t border-gray-200">
                <span>Total Amount (COD)</span>
                <span className="text-brand-green text-base font-mono">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard?tab=orders"
              className="flex-1 bg-brand-darkGreen hover:bg-brand-green text-white font-bold text-xs py-3.5 rounded-button text-center transition-colors shadow-soft"
            >
              Go to Account & Order History
            </Link>

            <Link
              href="/shop"
              className="flex-1 bg-brand-beige text-brand-darkGreen font-semibold text-xs py-3.5 rounded-button hover:bg-brand-mint/30 text-center border border-brand-mint/30 transition-colors"
            >
              Continue Shopping Herbal Teas →
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-modal shadow-premium w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-200 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-brand-darkGreen">
                  Cancel Order #{order.orderNumber}
                </h3>
                <p className="text-[11px] text-red-600 font-semibold">Confirm Order Cancellation</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                Are you sure you want to cancel this order? Once cancelled, the shipment will be stopped immediately.
              </p>

              <div className="bg-brand-beige p-3.5 rounded-card border border-brand-mint/30 text-gray-700 space-y-1">
                <p>Order Number: <strong className="font-mono text-brand-darkGreen">{order.orderNumber}</strong></p>
                <p>Total Amount: <strong className="text-brand-green font-mono">₹{order.total}</strong></p>
                <p>Payment: <strong>Cash on Delivery</strong></p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="px-4 py-2.5 rounded-button bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Keep My Order
              </button>

              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="px-5 py-2.5 rounded-button bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-soft disabled:opacity-50 flex items-center gap-1.5"
              >
                {isCancelling ? (
                  <span>Cancelling Order...</span>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Yes, Cancel Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-gray-500 font-semibold">
          Loading order details...
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
