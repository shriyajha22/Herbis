'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Badge, Modal, Button, Input } from '@/components/shared';
import { useStore } from '@/lib/storeContext';
import { Product } from '@/lib/types';

export default function AdminProductsPage() {
  const { showToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formMrp, setFormMrp] = useState('');
  const [formStock, setFormStock] = useState('100');
  const [formCategory, setFormCategory] = useState('Detox Tea');
  const [formDescription, setFormDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error('Failed to fetch admin products:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormPrice('');
    setFormMrp('');
    setFormStock('100');
    setFormCategory('Detox Tea');
    setFormDescription('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormPrice(String(p.price));
    setFormMrp(String(p.mrp || p.price));
    setFormStock(String(p.stock || 100));
    setFormCategory(p.category || 'Detox Tea');
    setFormDescription(p.description || '');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const priceNum = Number(formPrice);
    const mrpNum = Number(formMrp || formPrice);
    const stockNum = Number(formStock);

    if (!formName || priceNum <= 0) {
      showToast('Please provide a valid name and price', 'error');
      setSaving(false);
      return;
    }

    try {
      if (editingProduct) {
        // Edit product
        const slug = editingProduct.slug || editingProduct._id;
        const res = await fetch(`/api/products/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            price: priceNum,
            mrp: mrpNum,
            stock: stockNum,
            category: formCategory,
            description: formDescription,
            inStock: stockNum > 0,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Product updated successfully', 'success');
          setEditingProduct(null);
          fetchProducts();
        } else {
          showToast(data.message || 'Failed to update product', 'error');
        }
      } else {
        // Add new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            subtitle: '100% Organic Pure Herbal Infusion',
            category: formCategory,
            categoryName: formCategory,
            price: priceNum,
            mrp: mrpNum,
            stock: stockNum,
            inStock: stockNum > 0,
            description: formDescription || 'Hand-harvested farm fresh botanical herbs.',
            images: ['/images/blue-tea.jpg'],
            image: '/images/blue-tea.jpg',
            ingredients: [{ name: 'Organic Botanical Herbs', percentage: 100, benefit: 'Wellness' }],
            benefits: ['Detoxification', 'Vitality', 'Digestive Comfort'],
            caffeineLevel: 'Caffeine Free',
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Product added successfully', 'success');
          setShowAddModal(false);
          fetchProducts();
        } else {
          showToast(data.message || 'Failed to add product', 'error');
        }
      }
    } catch (err) {
      showToast('Error saving product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      const slug = product.slug || product._id;
      const res = await fetch(`/api/products/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Product deleted successfully', 'info');
        setProducts((prev) => prev.filter((p) => p._id !== product._id));
      } else {
        showToast(data.message || 'Failed to delete product', 'error');
      }
    } catch (e) {
      showToast('Error deleting product', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-darkGreen tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Manage your herbal teas, pricing, stock levels and descriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-brand-green text-white font-bold text-xs rounded-xl shadow-soft hover:bg-brand-darkGreen transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>Add New Tea</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:bg-white focus:border-brand-green outline-none"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 font-bold">Product</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Price</th>
                <th className="py-3.5 px-4 font-bold">Stock</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading product catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const imageSrc =
                    (p.images && p.images[0]) || (p as any).image || '/images/blue-tea.jpg';

                  return (
                    <tr key={p._id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-beige relative shrink-0 border border-gray-100">
                            <Image
                              src={imageSrc}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-brand-darkGreen">{p.name}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-1">{p.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-600">
                          {p.categoryName || p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-brand-darkGreen">₹{p.price}</span>
                        {p.mrp && p.mrp > p.price && (
                          <span className="text-[10px] text-gray-400 line-through ml-1.5">
                            ₹{p.mrp}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            (p.stock || 0) < 10 ? 'text-red-500' : 'text-gray-700'
                          }`}
                        >
                          {p.stock || 0} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={p.inStock ? 'success' : 'danger'}>
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 bg-gray-100 hover:bg-brand-cream text-brand-darkGreen rounded-xl transition-colors"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <Modal
          isOpen={Boolean(showAddModal || editingProduct)}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Herbal Tea'}
        >
          <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
            <Input
              label="Product Name"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Butterfly Blue Pea Tea"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Selling Price (₹)"
                type="number"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="499"
              />
              <Input
                label="MRP (₹)"
                type="number"
                value={formMrp}
                onChange={(e) => setFormMrp(e.target.value)}
                placeholder="699"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Stock Quantity"
                type="number"
                required
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                placeholder="100"
              />
              <div>
                <label className="block text-xs font-bold text-brand-darkGreen uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-brand-cream/40 border border-brand-mint/40 text-xs font-medium outline-none focus:bg-white focus:border-brand-green"
                >
                  <option value="Detox Tea">Detox Tea</option>
                  <option value="Sleep Tea">Sleep Tea</option>
                  <option value="Immunity Tea">Immunity Tea</option>
                  <option value="Weight Loss Tea">Weight Loss Tea</option>
                  <option value="Stress Relief Tea">Stress Relief Tea</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-darkGreen uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Full herbal tea description and health benefits..."
                className="w-full p-3 rounded-2xl bg-brand-cream/40 border border-brand-mint/40 text-xs font-medium outline-none focus:bg-white focus:border-brand-green"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
