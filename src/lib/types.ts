export interface Product {
  _id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string; // e.g. "detox-tea", "immunity-tea", "sleep-tea", etc.
  categoryName: string;
  price: number;
  mrp: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  images: string[];
  weightVariants: { weight: string; price: number; mrp: number }[];
  ingredients: { name: string; percentage?: string; icon?: string; description: string }[];
  benefits: string[];
  caffeineLevel: "Zero Caffeine" | "Low Caffeine" | "Medium Caffeine" | "High Caffeine" | "Naturally Caffeine-Free";
  brewingGuide: {
    temp: string; // e.g. "90°C / 195°F"
    steepTime: string; // e.g. "3-5 mins"
    waterAmount: string; // e.g. "200ml"
    servingSuggestion: string; // e.g. "Best enjoyed warm before sleep"
  };
  nutritionInfo: {
    calories: string;
    carbs: string;
    protein: string;
    fat: string;
    antioxidants: string;
  };
  flavorProfile?: string;
  storageInstructions?: string;
  netQuantity?: string;
  keyHerbs?: string[];
  certifications: string[]; // e.g., ["100% Organic", "USDA Certified", "Non-GMO", "Direct Farm Sourced"]
  sku: string;
  origin: string; // e.g., "Darjeeling High Altitude Farms"
  createdDate?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  image: string;
  itemCount: number;
  featured: boolean;
}

export interface Review {
  _id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
  helpfulCount: number;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string; // "Health Tips" | "Tea Knowledge"
  author: string;
  authorRole: string;
  authorImage: string;
  readTime: string;
  publishDate: string;
  coverImage: string;
  tags: string[];
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  selectedWeight: string;
  unitPrice: number;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: string;
}

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Order {
  _id: string;
  userId?: string;
  orderNumber: string;
  createdAt: string;
  items: {
    productId: string;
    productName: string;
    productImage?: string;
    image?: string;
    weight: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: Address;
  gstInvoice?: {
    companyName: string;
    gstin: string;
  };
  paymentMethod: "Cash on Delivery";
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: "Pending" | "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  trackingNumber?: string;
  courierName?: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  estimatedDelivery: string;
  cancelledAt?: string;
  cancelledBy?: string;
  previousStatus?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  avatar?: string;
  addresses: Address[];
  wishlist: string[]; // array of product IDs
  walletBalance: number;
  passwordHash?: string;
}

export interface ActiveSession {
  email: string;
  name: string;
  currentPage: string;
  loginTime: string;
  lastActive: string;
  isOnline: boolean;
}

