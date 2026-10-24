'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Mail, Trash2, Send, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Badge, Modal, Button } from '@/components/shared';
import { useStore } from '@/lib/storeContext';

export default function AdminSupportPage() {
  const { showToast } = useStore();
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [replyingQuery, setReplyingQuery] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchQueries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.queries)) {
        setQueries(data.queries);
      }
    } catch (e) {
      console.error('Failed to fetch contact queries:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Query marked as ${newStatus}`, 'success');
        setQueries((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
        );
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const handleDeleteQuery = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Inquiry deleted', 'info');
        setQueries((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (e) {
      showToast('Error deleting inquiry', 'error');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingQuery || !replyText.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId: replyingQuery.id,
          customerEmail: replyingQuery.email,
          customerName: replyingQuery.name,
          subject: replyingQuery.subject,
          replyMessage: replyText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Email reply dispatched successfully!', 'success');
        setReplyingQuery(null);
        setReplyText('');
        fetchQueries();
      } else {
        showToast(data.message || 'Failed to send reply', 'error');
      }
    } catch (err) {
      showToast('Error dispatching email reply', 'error');
    } finally {
      setSending(false);
    }
  };

  const filteredQueries = queries.filter((q) => {
    if (statusFilter === 'All') return true;
    return q.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-darkGreen tracking-tight">
            Customer Inquiries & Support
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Read customer messages, resolve wellness inquiries and send email replies
          </p>
        </div>
        <button
          onClick={fetchQueries}
          className="px-3.5 py-2 bg-white text-gray-700 font-bold text-xs rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Inquiries</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs">
        {['All', 'Unread', 'In Progress', 'Replied', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-colors ${
              statusFilter === tab
                ? 'bg-brand-green text-white shadow-soft'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Inquiries Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-3xl text-center text-gray-400 text-xs">
            Loading customer inquiries...
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center text-gray-400 text-xs">
            No inquiries matching your filter.
          </div>
        ) : (
          filteredQueries.map((q) => (
            <div
              key={q.id}
              className={`p-5 rounded-3xl border transition-all bg-white shadow-sm space-y-3 ${
                q.status === 'Unread' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-gray-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-cream text-brand-darkGreen font-bold flex items-center justify-center shrink-0 text-xs">
                    {q.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{q.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {q.email} {q.phone ? `• 📞 ${q.phone}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      q.status === 'Unread'
                        ? 'warning'
                        : q.status === 'Replied' || q.status === 'Resolved'
                        ? 'success'
                        : 'info'
                    }
                  >
                    {q.status || 'Unread'}
                  </Badge>

                  <select
                    value={q.status || 'Unread'}
                    onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                    className="text-[11px] bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 font-medium outline-none focus:border-brand-green"
                  >
                    <option value="Unread">Unread</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Replied">Replied</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Subject & Message Body */}
              <div className="bg-gray-50/70 p-4 rounded-2xl space-y-1">
                <p className="font-bold text-brand-darkGreen text-xs">
                  Subject: {q.subject || 'General Inquiry'}
                </p>
                <p className="text-gray-700 text-xs whitespace-pre-wrap leading-relaxed">
                  {q.message}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-gray-400">
                  Received: {new Date(q.createdAt).toLocaleString()}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setReplyingQuery(q);
                      setReplyText('');
                    }}
                    className="px-3 py-1.5 bg-brand-cream hover:bg-brand-mint/40 text-brand-darkGreen font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </button>
                  <button
                    onClick={() => handleDeleteQuery(q.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyingQuery && (
        <Modal
          isOpen={Boolean(replyingQuery)}
          onClose={() => setReplyingQuery(null)}
          title={`Reply to ${replyingQuery.name} (${replyingQuery.email})`}
        >
          <form onSubmit={handleSendReply} className="space-y-4 text-xs">
            <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Customer Message</span>
              <p className="text-gray-700 italic">&ldquo;{replyingQuery.message}&rdquo;</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-darkGreen uppercase tracking-wider mb-1">
                Official Response Message
              </label>
              <textarea
                rows={5}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the customer. This will be formatted into an official PrimeBrew Herbis branded email..."
                className="w-full p-3 rounded-2xl bg-brand-cream/40 border border-brand-mint/40 text-xs font-medium outline-none focus:bg-white focus:border-brand-green"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setReplyingQuery(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={sending}>
                Send Email Reply
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
