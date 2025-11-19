
import React, { useState } from 'react';
import { Store, ShoppingBag, MapPin, User, Briefcase, X } from 'lucide-react';

interface WelcomeProps {
  onSelectMode: (mode: 'buyer' | 'seller', sellerType?: 'business' | 'personal') => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onSelectMode }) => {
  const [showSellerOptions, setShowSellerOptions] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-pink-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl w-full relative z-10">
        <div className="text-center mb-12 text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">
            MercadoGenius <span className="text-pink-300">Nicaragua</span>
          </h1>
          <p className="text-xl opacity-90 font-light max-w-2xl mx-auto">
            La plataforma inteligente donde negocios y personas conectan para comprar y vender localmente.
          </p>
        </div>

        {!showSellerOptions ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Buyer Option */}
            <button 
              onClick={() => onSelectMode('buyer')}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl hover:shadow-pink-500/20 transition-all transform hover:-translate-y-2 group text-left relative overflow-hidden border border-white/20"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-100 to-rose-100 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">Quiero Comprar</h2>
                <p className="text-gray-500 mb-6 min-h-[3rem]">Explora tiendas locales, chatea con vendedores y encuentra productos únicos cerca de ti.</p>
                <div className="flex items-center text-pink-600 font-bold text-sm uppercase tracking-wide">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Buscar en Nicaragua</span>
                </div>
              </div>
            </button>

            {/* Seller Option (Opens Submenu) */}
            <button 
              onClick={() => setShowSellerOptions(true)}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-2 group text-left relative overflow-hidden border border-white/20"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Store className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">Quiero Vender</h2>
                <p className="text-gray-500 mb-6 min-h-[3rem]">Abre tu tienda digital o vende artículos individuales rápidamente con ayuda de IA.</p>
                <div className="flex items-center text-indigo-600 font-bold text-sm uppercase tracking-wide">
                  <User className="w-4 h-4 mr-2" />
                  <span>Empezar a Vender</span>
                </div>
              </div>
            </button>
          </div>
        ) : (
          /* SELLER SUB-SELECTION */
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-3xl mx-auto border border-white/20 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-6 text-white">
                <h2 className="text-2xl font-bold">¿Cómo quieres vender?</h2>
                <button onClick={() => setShowSellerOptions(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>
             
             <div className="grid md:grid-cols-2 gap-4">
                <button 
                   onClick={() => onSelectMode('seller', 'business')}
                   className="bg-white p-6 rounded-2xl text-left hover:bg-indigo-50 transition-colors group relative overflow-hidden"
                >
                   <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-600">
                      <Briefcase className="w-24 h-24" />
                   </div>
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                      <Store className="w-6 h-6" />
                   </div>
                   <h3 className="font-bold text-gray-900 text-lg mb-1">Negocio Establecido</h3>
                   <p className="text-sm text-gray-500">Tengo una tienda física o marca y quiero crear un catálogo completo.</p>
                </button>

                <button 
                   onClick={() => onSelectMode('seller', 'personal')}
                   className="bg-white p-6 rounded-2xl text-left hover:bg-pink-50 transition-colors group relative overflow-hidden"
                >
                   <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-pink-600">
                      <User className="w-24 h-24" />
                   </div>
                   <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-4">
                      <ShoppingBag className="w-6 h-6" />
                   </div>
                   <h3 className="font-bold text-gray-900 text-lg mb-1">Vendedor Particular</h3>
                   <p className="text-sm text-gray-500">No tengo tienda, solo quiero vender algunos artículos (ropa usada, postres, etc).</p>
                </button>
             </div>
          </div>
        )}
        
        <div className="text-center mt-12 text-white/60 text-sm font-medium">
          &copy; {new Date().getFullYear()} MercadoGenius Nicaragua • Potenciado por IA
        </div>
      </div>
    </div>
  );
};
