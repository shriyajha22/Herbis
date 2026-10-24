import mongoose, { Schema, Document, Model } from 'mongoose';
import { Product as ProductType } from '@/lib/types';

export interface IProductDocument extends Omit<ProductType, '_id'>, Document {}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    subtitle: { type: String, default: '' },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    category: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    stock: { type: Number, default: 100 },
    inStock: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    images: [{ type: String }],
    benefits: [{ type: String }],
    ingredients: [
      {
        name: String,
        percentage: String,
        icon: String,
        description: String,
      },
    ],
    nutritionInfo: {
      calories: String,
      carbs: String,
      protein: String,
      fat: String,
      antioxidants: String,
    },
    brewingGuide: {
      temp: String,
      steepTime: String,
      waterAmount: String,
      servingSuggestion: String,
    },
    caffeineLevel: { type: String, default: 'Zero Caffeine' },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    weightVariants: [
      {
        weight: String,
        price: Number,
        mrp: Number,
      },
    ],
    flavorProfile: String,
    storageInstructions: String,
    netQuantity: String,
    keyHerbs: [{ type: String }],
  },
  { timestamps: true }
);

export const ProductModel: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
