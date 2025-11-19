
import React, { useState, useEffect } from 'react';
import { Welcome } from './views/Welcome';
import { StoreSetup } from './views/StoreSetup';
import { Dashboard } from './views/Dashboard';
import { AddProduct } from './views/AddProduct';
import { ProductDetail } from './views/ProductDetail';
import { BuyerDashboard } from './views/BuyerDashboard';
import { Storefront } from './views/Storefront';
import { Navbar } from './components/Navbar';
import { getStoreById, getActiveSellerId, logoutSeller, getAllStores } from './services/storageService';
import { StoreProfile, Product } from './types';

type ViewState = 'welcome' | 'setup' | 'dashboard' | 'add-product' | 'product-detail' | 'buyer-dashboard' | 'storefront';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('welcome');
  const [userMode, setUserMode] = useState<'buyer' | 'seller' | null>(null);
  
  // Seller State
  const [activeStore, setActiveStore] = useState<StoreProfile | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sellerSetupMode, setSellerSetupMode] = useState<'business' | 'personal'>('business');
  
  // Buyer/Shared State
  const [selectedStore, setSelectedStore] = useState<StoreProfile | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Check if seller was logged in
    const sellerId = getActiveSellerId();
    if (sellerId) {
      const store = getStoreById(sellerId);
      if (store) {
        setActiveStore(store);
        setUserMode('seller');
        setView('dashboard');
      }
    }
  }, []);

  const handleSelectMode = (mode: 'buyer' | 'seller', sellerType: 'business' | 'personal' = 'business') => {
    setUserMode(mode);
    if (mode === 'buyer') {
      setView('buyer-dashboard');
    } else {
      setSellerSetupMode(sellerType);
      // If seller, check if already logged in
      if (activeStore) {
        setView('dashboard');
      } else {
        setView('setup');
      }
    }
  };

  // Seller Actions
  const handleStoreCreated = (newStore: StoreProfile) => {
    setActiveStore(newStore);
    setView('dashboard');
  };

  const handleLogout = () => {
    // Removed window.confirm to ensure the button works reliably in all environments
    logoutSeller();
    setActiveStore(undefined);
    setUserMode(null);
    setView('welcome');
  };

  // Buyer Navigation
  const handleSelectStore = (store: StoreProfile) => {
    setSelectedStore(store);
    setView('storefront');
  };

  const handleSelectProduct = (product: Product) => {
    // If finding a product globally, we need to set the store context for the detail view
    // so the "Chat" feature works correctly
    if (userMode === 'buyer') {
       const allStores = getAllStores();
       const productStore = allStores.find(s => s.id === product.storeId);
       if (productStore) {
          setSelectedStore(productStore);
       }
    }
    setSelectedProduct(product);
    setView('product-detail');
  };

  // RENDER LOGIC

  if (view === 'welcome') {
    return <Welcome onSelectMode={handleSelectMode} />;
  }

  if (view === 'setup') {
    return (
      <StoreSetup 
        mode={sellerSetupMode} 
        onComplete={handleStoreCreated} 
        onCancel={() => setView('welcome')} 
      />
    );
  }

  if (view === 'buyer-dashboard') {
    return (
       <BuyerDashboard 
          onSelectStore={handleSelectStore} 
          onSelectProduct={handleSelectProduct}
          onBack={() => setView('welcome')} 
       />
    );
  }

  if (view === 'storefront' && selectedStore) {
    return (
      <Storefront 
        store={selectedStore} 
        onBack={() => setView('buyer-dashboard')} 
        onSelectProduct={handleSelectProduct}
      />
    );
  }

  if (view === 'product-detail' && selectedProduct) {
    const productStore = userMode === 'seller' ? activeStore : selectedStore;
    if (!productStore) return null;

    return (
      <div className="min-h-screen bg-slate-50 flex text-gray-800 font-sans">
         {userMode === 'seller' && activeStore && (
           <Navbar 
              currentView={view} 
              setCurrentView={(v) => setView(v as ViewState)} 
              store={activeStore} 
              onLogout={handleLogout}
            />
         )}
          <main className={`flex-1 transition-all duration-300 ${userMode === 'seller' ? 'ml-64' : ''}`}>
            <ProductDetail 
              product={selectedProduct} 
              store={productStore}
              onBack={() => {
                if (userMode === 'seller') setView('dashboard');
                else {
                   // If coming from global search or storefront
                   // Ideally we just go back to dashboard for now to keep it simple or check history
                   setView('buyer-dashboard'); 
                }
              }} 
            />
          </main>
      </div>
    )
  }

  if (userMode === 'seller' && activeStore) {
    return (
      <div className="min-h-screen bg-slate-50 flex text-gray-800 font-sans">
        <Navbar 
          currentView={view} 
          setCurrentView={(v) => setView(v as ViewState)} 
          store={activeStore} 
          onLogout={handleLogout}
        />

        <main className="flex-1 ml-64 transition-all duration-300">
          {view === 'dashboard' && (
            <Dashboard 
              refreshTrigger={refreshTrigger} 
              onSelectProduct={handleSelectProduct}
            />
          )}
          
          {view === 'add-product' && (
             <AddProduct 
               storeId={activeStore.id} 
               onProductAdded={() => {
                 setRefreshTrigger(prev => prev + 1);
                 setView('dashboard');
               }}
               onCancel={() => setView('dashboard')}
             />
          )}
        </main>
      </div>
    );
  }

  return null;
};

export default App;
