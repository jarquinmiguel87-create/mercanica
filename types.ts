
export enum ProductCategory {
  CAMISAS = 'Camisas',
  PANTALONES = 'Pantalones',
  ZAPATOS = 'Zapatos',
  ACCESORIOS = 'Accesorios',
  DEPORTIVO = 'Ropa Deportiva',
  VESTIDOS = 'Vestidos',
  CHAQUETAS = 'Chaquetas',
  OTRO = 'Otro'
}

export const NICARAGUA_CITIES = [
  'Managua',
  'León',
  'Granada',
  'Estelí',
  'Matagalpa',
  'Chinandega',
  'Masaya',
  'Rivas',
  'Jinotega',
  'Bluefields'
];

export interface Product {
  id: string;
  storeId: string;
  name: string;
  brand: string;
  price: number;
  currency: 'USD' | 'NIO';
  size: string;
  category: ProductCategory;
  description: string;
  images: string[];
  createdAt: number;
}

export interface StoreProfile {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  themeColor: string;
  city: string;
  address: string;
  mapUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
  isPersonal?: boolean; 
}

export interface AIProductSuggestion {
  description: string;
  suggestedCategory: string; 
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number; 
  comment: string;
  date: number;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}
