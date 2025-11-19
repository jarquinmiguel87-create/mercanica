
import React from 'react';
import { Product } from '../types';
import { Tag, Trash2, Eye, Layers, Star, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onSelect?: (product: Product) => void;
  storeName?: string;
  storeReputation?: { rating: number; status: string; count: number };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onSelect, storeName, storeReputation }) => {
  const currencySymbol = product.currency === 'NIO' ? 'C$' : '$';
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : undefined;
  const imageCount = product.images ? product.images.length : 0;

  // Render Stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        <Star className={`w-3 h-3 ${rating >= 1 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        <span className="text-xs font-bold text-gray-600 ml-1">{rating > 0 ? rating.toFixed(1) : 'Nuevo'}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group relative">
      
      {/* Scam Alert Banner */}
      {storeReputation?.status === 'SCAM_ALERT' && (
        <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 text-center uppercase flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Alerta: Vendedor con mala reputación
        </div>
      )}

      <div className="relative h-48 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => onSelect && onSelect(product)}>
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Tag className="w-12 h-12" />
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-1">
           {imageCount > 1 && (
             <span className="bg-black/50 backdrop-blur-sm px-1.5 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1">
               <Layers className="w-3 h-3" /> {imageCount}
             </span>
           )}
           <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm border border-gray-200">
             {product.size}
           </span>
        </div>
        
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <div className="bg-white px-4 py-2 rounded-full font-medium text-sm text-gray-900 flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <Eye className="w-4 h-4" /> Ver Detalles
             </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        
        {/* Seller Info (Only shown if provided, usually in Buyer Dashboard) */}
        {storeName && (
          <div className="flex justify-between items-center mb-2 border-b border-gray-50 pb-2">
            <span className="text-xs font-medium text-gray-500 truncate max-w-[120px]">{storeName}</span>
            {storeReputation && (
              <div className="flex items-center">
                 {storeReputation.status === 'EXCELLENT' && <ShieldCheck className="w-3 h-3 text-green-500 mr-1" />}
                 {renderStars(storeReputation.rating)}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                {product.brand}
            </span>
            <span className="text-xs text-gray-400">
                {product.category}
            </span>
        </div>
        
        <h3 
          onClick={() => onSelect && onSelect(product)}
          className="font-bold text-gray-800 text-lg leading-tight mb-2 cursor-pointer hover:text-primary transition-colors"
        >
            {product.name}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-3 flex-1 mb-4">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
          <span className="text-xl font-bold text-gray-900">{currencySymbol}{product.price.toFixed(2)}</span>
          <div className="flex gap-2">
             <button 
                onClick={() => onSelect && onSelect(product)}
                className="p-2 text-gray-400 hover:text-primary hover:bg-indigo-50 rounded-full transition-colors"
                title="Ver detalles"
             >
                <Eye className="w-4 h-4" />
             </button>
             {/* Delete button only appears if onDelete is passed and not viewing as buyer mainly */}
             {!storeName && (
               <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Eliminar producto"
               >
                  <Trash2 className="w-4 h-4" />
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
