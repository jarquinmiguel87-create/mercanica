
import { Product, StoreProfile, Review } from "../types";

const STORES_KEY = 'mercadogenius_stores_v2';
const ACTIVE_SELLER_ID_KEY = 'mercadogenius_active_seller_id';
const PRODUCTS_KEY = 'mercadogenius_products';
const REVIEWS_KEY = 'mercadogenius_reviews';

// --- Store Logic ---

export const getAllStores = (): StoreProfile[] => {
  const data = localStorage.getItem(STORES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getStoreById = (storeId: string): StoreProfile | undefined => {
  const stores = getAllStores();
  return stores.find(s => s.id === storeId);
};

export const getActiveSellerId = (): string | null => {
  return localStorage.getItem(ACTIVE_SELLER_ID_KEY);
};

export const setActiveSellerId = (id: string) => {
  localStorage.setItem(ACTIVE_SELLER_ID_KEY, id);
};

export const logoutSeller = () => {
  localStorage.removeItem(ACTIVE_SELLER_ID_KEY);
};

export const saveStore = (store: StoreProfile): void => {
  const stores = getAllStores();
  const existingIndex = stores.findIndex(s => s.id === store.id);
  
  if (existingIndex >= 0) {
    stores[existingIndex] = store;
  } else {
    stores.push(store);
  }
  
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  setActiveSellerId(store.id);
};

// --- Product Logic ---

export const getProducts = (storeId?: string): Product[] => {
  const data = localStorage.getItem(PRODUCTS_KEY);
  let allProducts: any[] = data ? JSON.parse(data) : [];
  
  // Migration: handle old products with single imageUrl
  allProducts = allProducts.map(p => {
    if (p.imageUrl && (!p.images || p.images.length === 0)) {
      return { ...p, images: [p.imageUrl] };
    }
    if (!p.images) {
      return { ...p, images: [] };
    }
    return p;
  });
  
  if (storeId) {
    return allProducts.filter(p => p.storeId === storeId);
  }
  return allProducts as Product[];
};

export const saveProduct = (product: Product): void => {
  const products = getProducts(); // Gets all (with migration applied)
  products.unshift(product); 
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    alert("¡Almacenamiento lleno! Intenta borrar productos antiguos o subir imágenes menos pesadas.");
    console.error("Storage quota exceeded", e);
  }
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts().filter(p => p.id !== productId);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

// --- Reviews Logic ---

export const getReviews = (productId: string): Review[] => {
  const data = localStorage.getItem(REVIEWS_KEY);
  const allReviews: Review[] = data ? JSON.parse(data) : [];
  return allReviews.filter(r => r.productId === productId).sort((a, b) => b.date - a.date);
};

export const addReview = (review: Review): void => {
  const data = localStorage.getItem(REVIEWS_KEY);
  const allReviews: Review[] = data ? JSON.parse(data) : [];
  allReviews.unshift(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));
};

// --- Reputation Logic ---

export interface ReputationResult {
  rating: number;
  count: number;
  status: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'POOR' | 'SCAM_ALERT';
}

export const getStoreReputation = (storeId: string): ReputationResult => {
  const storeProducts = getProducts(storeId);
  const productIds = storeProducts.map(p => p.id);
  
  const data = localStorage.getItem(REVIEWS_KEY);
  const allReviews: Review[] = data ? JSON.parse(data) : [];
  
  const storeReviews = allReviews.filter(r => productIds.includes(r.productId));
  
  if (storeReviews.length === 0) {
    return { rating: 0, count: 0, status: 'NEUTRAL' };
  }

  const sum = storeReviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = sum / storeReviews.length;

  let status: ReputationResult['status'] = 'GOOD';
  
  if (avg >= 4.5 && storeReviews.length >= 3) status = 'EXCELLENT';
  else if (avg >= 3.5) status = 'GOOD';
  else if (avg >= 2) status = 'NEUTRAL';
  else if (avg > 0 && avg < 2) status = 'SCAM_ALERT'; // Very low rating
  else status = 'POOR';

  return { rating: avg, count: storeReviews.length, status };
};

// --- Helpers ---

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width *= maxWidth / height;
            height = maxWidth;
          }
        }

        elem.width = width;
        elem.height = height;
        
        const ctx = elem.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG
        const dataUrl = elem.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
