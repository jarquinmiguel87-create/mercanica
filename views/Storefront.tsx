
import React, { useState, useMemo } from 'react';
import { StoreProfile, Product, ProductCategory } from '../types';
import { getProducts } from '../services/storageService';
import { ProductCard } from '../components/ProductCard';
import { ArrowLeft, MapPin, ExternalLink, User, Home } from 'lucide-react';

interface StorefrontProps {
  store: StoreProfile;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ store, onBack, onSelectProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  
  const products = useMemo(() => getProducts(store.id), [store.id]);
  
  const filteredProducts = useMemo(() => {
     return selectedCategory === 'Todos' 
       ? products 
       : products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const isPersonal = store.isPersonal;

  return (
    <div className="min-h-screen bg-slate-50">
       {/* Store Header */}
       <div className="bg-white pb-6 shadow-sm">
          <div className={`h-32 relative ${isPersonal ? 'bg-gradient-to-r from-pink-600 to-rose-500' : 'bg-gradient-to-r from-slate-800 to-slate-900'}`}>
             <div className="absolute top-0 left-0 w-full flex justify-between p-4">
                <button 
                  onClick={onBack}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur text-white p-2 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
             </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6">
             <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-white flex items-center justify-center">
                   {store.logoUrl ? (
                      <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gray-50">
                         {isPersonal ? (
                           <User className="w-10 h-10 text-pink-500" />
                         ) : (
                           <span className="text-primary">{store.name.charAt(0)}</span>
                         )}
                      </div>
                   )}
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
                      {isPersonal && (
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-bold rounded-full uppercase tracking-wide">
                           Vendedor Particular
                        </span>
                      )}
                   </div>
                   <p className="text-gray-500 mt-1">{store.description}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm max-w-xs w-full md:w-auto">
                   <div className="font-semibold text-gray-800 mb-1 flex items-center">
                      <MapPin className={`w-3.5 h-3.5 mr-1 ${isPersonal ? 'text-pink-500' : 'text-primary'}`} /> 
                      {isPersonal ? 'Zona' : 'Ubicación'}
                   </div>
                   <p className="text-gray-600 text-xs mb-2">{store.address}, {store.city}</p>
                   {store.mapUrl && (
                      <a 
                        href={store.mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`text-xs hover:underline flex items-center ${isPersonal ? 'text-pink-500' : 'text-primary'}`}
                      >
                        Ver mapa <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                   )}
                </div>
             </div>
             
             {/* Categories */}
             <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                <button 
                   onClick={() => setSelectedCategory('Todos')}
                   className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'Todos' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                   Todos
                </button>
                {Object.values(ProductCategory).map(cat => (
                   <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                   >
                      {cat}
                   </button>
                ))}
             </div>
          </div>
       </div>

       {/* Product Grid */}
       <div className="max-w-7xl mx-auto p-6">
          {filteredProducts.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                   <ProductCard 
                      key={product.id}
                      product={product}
                      onDelete={() => {}} // Customers can't delete
                      onSelect={onSelectProduct}
                   />
                ))}
             </div>
          ) : (
             <div className="py-20 text-center text-gray-400">
                <p>Este vendedor aún no tiene productos en esta categoría.</p>
             </div>
          )}
       </div>
    </div>
  );
};
