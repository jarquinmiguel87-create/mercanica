
import React, { useState, useMemo } from 'react';
import { StoreProfile, Product, NICARAGUA_CITIES } from '../types';
import { Store, MapPin, Search, ArrowRight, ArrowLeft, ShoppingBag, PackageOpen, User, Star, ShieldAlert, ShieldCheck } from 'lucide-react';
import { getAllStores, getProducts, getStoreReputation } from '../services/storageService';
import { ProductCard } from '../components/ProductCard';

interface BuyerDashboardProps {
  onSelectStore: (store: StoreProfile) => void;
  onSelectProduct: (product: Product) => void;
  onBack: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onSelectStore, onSelectProduct, onBack }) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'stores' | 'products'>('stores');

  const allStores = useMemo(() => getAllStores(), []);
  const allProducts = useMemo(() => getProducts(), []); // Get all products from all stores

  // Calculate reputation for all stores once
  const storeReputations = useMemo(() => {
    const reputations: Record<string, any> = {};
    allStores.forEach(store => {
      reputations[store.id] = getStoreReputation(store.id);
    });
    return reputations;
  }, [allStores]);

  // Filter Stores
  const filteredStores = useMemo(() => {
    if (!selectedCity) return [];
    return allStores.filter(store => {
      const matchesCity = store.city === selectedCity;
      const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            store.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [allStores, selectedCity, searchTerm]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    if (!selectedCity) return [];
    
    // First, get IDs of stores in this city
    const storesInCity = allStores.filter(s => s.city === selectedCity).map(s => s.id);
    
    return allProducts.filter(product => {
      // Check if product belongs to a store in the selected city
      const isInCity = storesInCity.includes(product.storeId);
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return isInCity && matchesSearch;
    });
  }, [allProducts, allStores, selectedCity, searchTerm]);

  const renderStoreStars = (storeId: string) => {
    const rep = storeReputations[storeId];
    if (!rep) return null;
    
    if (rep.status === 'SCAM_ALERT') {
      return (
        <div className="flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded-full">
           <ShieldAlert className="w-3 h-3" /> ALERTA
        </div>
      );
    }

    if (rep.count === 0) {
       return <span className="text-xs text-gray-400">Nuevo</span>;
    }

    return (
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-bold text-gray-700">{rep.rating.toFixed(1)}</span>
        <span className="text-[10px] text-gray-400">({rep.count})</span>
      </div>
    );
  };

  if (!selectedCity) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center relative">
        <button onClick={onBack} className="absolute top-6 left-6 flex items-center text-gray-500 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5 mr-2" /> Volver
        </button>
        
        <div className="text-center mb-12 max-w-2xl">
           <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-500">
              <MapPin className="w-10 h-10" />
           </div>
           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Dónde quieres comprar hoy?</h1>
           <p className="text-gray-500 text-lg">Selecciona tu ciudad en Nicaragua para ver ofertas cerca de ti.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl">
           {NICARAGUA_CITIES.map(city => (
             <button
               key={city}
               onClick={() => setSelectedCity(city)}
               className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-pink-200 transition-all group text-left"
             >
               <span className="block text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors">{city}</span>
               <span className="text-xs text-gray-400 flex items-center mt-2">
                 Ver ofertas <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
               </span>
             </button>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
           
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <button onClick={() => setSelectedCity('')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                 </button>
                 <div>
                    <p className="text-xs text-gray-400 font-medium">Ubicación</p>
                    <h1 className="text-lg font-bold text-gray-900 flex items-center gap-1">
                       <MapPin className="w-4 h-4 text-pink-500" /> {selectedCity}
                    </h1>
                 </div>
              </div>
              
              <div className="flex items-center gap-2">
                  {/* Search Type Toggle */}
                  <div className="bg-gray-100 p-1 rounded-lg flex mr-2">
                     <button 
                        onClick={() => setSearchType('stores')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${searchType === 'stores' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                        Negocios
                     </button>
                     <button 
                        onClick={() => setSearchType('products')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${searchType === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                        Artículos
                     </button>
                  </div>
              </div>
           </div>

           <div className="relative w-full">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input 
               type="text" 
               placeholder={searchType === 'stores' ? "Buscar tienda por nombre..." : "Buscar camisas, zapatos, etc..."}
               className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
         
         {/* STORES GRID */}
         {searchType === 'stores' && (
           <>
              {filteredStores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStores.map(store => (
                    <div 
                      key={store.id} 
                      onClick={() => onSelectStore(store)}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 group relative"
                    >
                      <div className="h-24 bg-gradient-to-r from-pink-500 to-rose-400 relative">
                         <div className="absolute -bottom-8 left-6 w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden">
                            {store.logoUrl ? (
                               <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                            ) : (
                               <span className="text-2xl font-bold text-gray-800">{store.name.charAt(0)}</span>
                            )}
                         </div>
                      </div>
                      <div className="pt-12 pb-6 px-6">
                         <div className="flex justify-between items-start mb-1">
                           <div>
                             <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">{store.name}</h3>
                             {store.isPersonal && (
                               <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Particular</span>
                             )}
                           </div>
                           <div className="flex flex-col items-end gap-1">
                              <span className="bg-pink-50 text-pink-600 px-2 py-1 rounded-md text-xs font-medium">
                                  {store.city}
                              </span>
                              {renderStoreStars(store.id)}
                           </div>
                         </div>
                         <p className="text-gray-500 text-sm mt-2 line-clamp-2">{store.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                   <Store className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-gray-900">No se encontraron tiendas</h3>
                   <p className="text-gray-500">Intenta cambiar la búsqueda o la ciudad.</p>
                </div>
              )}
           </>
         )}

         {/* PRODUCTS GRID */}
         {searchType === 'products' && (
            <>
               {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => {
                      const store = allStores.find(s => s.id === product.storeId);
                      const reputation = store ? storeReputations[store.id] : undefined;
                      
                      return (
                        <ProductCard 
                          key={product.id}
                          product={product}
                          onDelete={() => {}}
                          onSelect={onSelectProduct}
                          storeName={store?.name}
                          storeReputation={reputation}
                        />
                      );
                    })}
                  </div>
               ) : (
                  <div className="text-center py-20">
                     <PackageOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900">No se encontraron artículos</h3>
                     <p className="text-gray-500">Intenta buscar con otro nombre.</p>
                  </div>
               )}
            </>
         )}
      </div>
    </div>
  );
};
