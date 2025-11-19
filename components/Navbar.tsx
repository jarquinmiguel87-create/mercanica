
import React from 'react';
import { Store, ShoppingBag, PlusCircle, LogOut } from 'lucide-react';
import { StoreProfile } from '../types';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  store: StoreProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, store, onLogout }) => {
  const navItemClass = (view: string) => `
    flex items-center px-4 py-3 cursor-pointer transition-colors duration-200
    ${currentView === view ? 'text-primary bg-indigo-50 border-r-4 border-primary' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
  `;

  if (!store) return null;

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-lg z-50 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Store className="w-8 h-8" />
          <span>Mercado<span className="text-gray-800">Genius</span></span>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
        {/* Simple background pattern */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
        
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-white/30 overflow-hidden shrink-0">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold bg-indigo-50">
                {store.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
             <p className="text-xs uppercase tracking-wider opacity-80">Tu Tienda</p>
             <h2 className="font-bold text-lg truncate w-32">{store.name}</h2>
          </div>
        </div>
        <p className="text-sm opacity-90 truncate relative z-10">Hola, {store.ownerName.split(' ')[0]}</p>
      </div>

      <nav className="flex-1 py-4">
        <div onClick={() => setCurrentView('dashboard')} className={navItemClass('dashboard')}>
          <ShoppingBag className="w-5 h-5 mr-3" />
          <span className="font-medium">Mis Productos</span>
        </div>
        <div onClick={() => setCurrentView('add-product')} className={navItemClass('add-product')}>
          <PlusCircle className="w-5 h-5 mr-3" />
          <span className="font-medium">Nuevo Producto</span>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={onLogout}
          className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Cerrar Tienda</span>
        </button>
      </div>
    </div>
  );
};
