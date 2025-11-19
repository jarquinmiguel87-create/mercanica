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
  const allProducts: Product[] = data ? JSON.parse(data) : [];
  
  if (storeId) {
    return allProducts.filter(p => p.storeId === storeId);
  }
  return allProducts;
};

export const saveProduct = (product: Product): void => {
  const products = getProducts(); // Gets all
  products.unshift(product); 
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
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

// --- Helpers ---

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};