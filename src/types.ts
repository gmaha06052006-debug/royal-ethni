export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  rating: number;
  reviews: Review[];
  craftsmanship: string;
  fabric: string;
  careInstructions: string;
  occasion: string[];
  featured: boolean;
  isNewArrival: boolean;
  bestSeller: boolean;
  discountPrice?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Tailoring' | 'Shipped' | 'Delivered';
  paymentMethod: 'COD' | 'Razorpay';
  paymentStatus: 'Pending' | 'Paid';
  trackingNumber?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
}

export interface SavedAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
}

export interface UserProfile {
  email: string;
  name: string;
  addresses: SavedAddress[];
  wishlist: string[]; // Product IDs
}

export interface StylistMessage {
  sender: 'user' | 'assistant';
  text: string;
  suggestedProducts?: string[]; // Product IDs
  timestamp: string;
}
