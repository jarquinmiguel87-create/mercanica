
import React, { useState } from 'react';
import { Store, ArrowRight, Sparkles, MapPin, UserCircle, Image as ImageIcon, Upload } from 'lucide-react';
import { StoreProfile, NICARAGUA_CITIES } from '../types';
import { saveStore, compressImage } from '../services/storageService';

interface StoreSetupProps {
  mode: 'business' | 'personal';
  onComplete: (store: StoreProfile) => void;
  onCancel?: () => void;
}

export const StoreSetup: React.FC<StoreSetupProps> = ({ mode, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', 
    ownerName: '',
    description: '',
    city: NICARAGUA_CITIES[0],
    address: '',
    mapUrl: ''
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        // Compress logo to 300px max to save space
        const base64 = await compressImage(e.target.files[0], 300, 0.8);
        setLogoPreview(base64);
      } catch (error) {
        console.error("Error reading file", error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerName) return;
    
    if (mode === 'business' && !formData.name) return;

    const storeName = mode === 'business' ? formData.name : `Ventas de ${formData.ownerName.split(' ')[0]}`;
    
    const newStore: StoreProfile = {
      id: Date.now().toString(),
      name: storeName,
      ownerName: formData.ownerName,
      description: formData.description || (mode === 'personal' ? 'Venta de artículos variados' : ''),
      themeColor: mode === 'business' ? 'indigo' : 'pink',
      city: formData.city,
      address: formData.address || 'Acordar con vendedor',
      mapUrl: formData.mapUrl,
      logoUrl: logoPreview || undefined,
      isPersonal: mode === 'personal'
    };

    saveStore(newStore);
    onComplete(newStore);
  };

  const isPersonal = mode === 'personal';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className={`${isPersonal ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-primary'} p-8 text-center relative transition-colors duration-300`}>
          {onCancel && (
             <button onClick={onCancel} className="absolute top-4 right-4 text-white/80 hover:text-white text-sm">Cancelar</button>
          )}
          
          {/* Logo Upload Section */}
          <div className="relative mx-auto w-24 h-24 mb-4 group cursor-pointer">
            <div className={`w-full h-full rounded-full border-4 border-white/30 overflow-hidden flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-inner relative`}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                isPersonal ? <UserCircle className="w-12 h-12 text-white" /> : <Store className="w-12 h-12 text-white" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
            </div>
            <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoChange}
                className="absolute inset-0 opacity-0 cursor-pointer rounded-full" 
            />
          </div>
          
          <h1 className="text-2xl font-bold text-white">
            {isPersonal ? 'Perfil de Vendedor' : 'Registra tu Negocio'}
          </h1>
          <p className="text-indigo-50 mt-2 text-sm opacity-90">
             {logoPreview ? '¡Se ve genial!' : 'Haz clic en el icono para subir tu foto'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {/* Name Section */}
          <div className="grid grid-cols-1 gap-4">
            {!isPersonal && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
                <input
                  type="text"
                  required={!isPersonal}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ej. Variedades María"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre Completo</label>
              <input
                type="text"
                required
                className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 outline-none transition-all ${isPersonal ? 'focus:ring-pink-500' : 'focus:ring-indigo-500'}`}
                placeholder="Ej. Juan Pérez"
                value={formData.ownerName}
                onChange={e => setFormData({...formData, ownerName: e.target.value})}
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <div className={`flex items-center gap-2 mb-3 ${isPersonal ? 'text-pink-600' : 'text-indigo-600'}`}>
                <MapPin className="w-4 h-4" />
                <span className="font-semibold text-sm">Ubicación {isPersonal ? 'General' : 'del Negocio'}</span>
             </div>
             
             <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ciudad</label>
                  <select
                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 outline-none bg-white ${isPersonal ? 'focus:ring-pink-500' : 'focus:ring-indigo-500'}`}
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  >
                    {NICARAGUA_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {isPersonal ? 'Punto de referencia o entrega' : 'Dirección Exacta'}
                  </label>
                  <input
                    type="text"
                    required={!isPersonal}
                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 outline-none ${isPersonal ? 'focus:ring-pink-500' : 'focus:ring-indigo-500'}`}
                    placeholder={isPersonal ? "Ej. Cerca de la UCA, Metrocentro..." : "Ej. De la iglesia San Francisco 2c abajo"}
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                {!isPersonal && (
                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">Google Maps Link (Opcional)</label>
                     <div className="flex gap-2">
                        <input
                          type="url"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Pega el enlace de Google Maps"
                          value={formData.mapUrl}
                          onChange={e => setFormData({...formData, mapUrl: e.target.value})}
                        />
                     </div>
                  </div>
                )}
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {isPersonal ? '¿Qué vas a vender? (Corto)' : 'Descripción del Negocio'}
            </label>
            <textarea
              className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 outline-none h-20 resize-none ${isPersonal ? 'focus:ring-pink-500' : 'focus:ring-indigo-500'}`}
              placeholder={isPersonal ? "Ej. Ropa de segunda mano, postres caseros..." : "Describe tu negocio y horario..."}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-white shadow-lg hover:shadow-xl transform active:scale-95 ${isPersonal ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-900 hover:bg-gray-800'}`}
          >
            <span>{isPersonal ? 'Empezar a Publicar' : 'Abrir Tienda'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
             <Sparkles className="w-3 h-3" />
             <span>Potenciado por IA</span>
          </div>
        </form>
      </div>
    </div>
  );
};
