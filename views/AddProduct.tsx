
import React, { useState } from 'react';
import { Wand2, Image as ImageIcon, Loader2, Save, X } from 'lucide-react';
import { ProductCategory, Product, AIProductSuggestion } from '../types';
import { fileToBase64, saveProduct } from '../services/storageService';
import { generateProductDetails } from '../services/geminiService';

interface AddProductProps {
  storeId: string;
  onProductAdded: () => void;
  onCancel: () => void;
}

export const AddProduct: React.FC<AddProductProps> = ({ storeId, onProductAdded, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    currency: 'USD' as 'USD' | 'NIO',
    size: '',
    category: ProductCategory.OTRO,
    description: '',
    additionalDetails: '' // Used for AI prompt
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setImagePreview(base64);
      } catch (error) {
        console.error("Error reading file", error);
      }
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.name) {
      alert("Por favor ingresa al menos el nombre del producto.");
      return;
    }
    setIsGenerating(true);
    
    const suggestion: AIProductSuggestion | null = await generateProductDetails(
      formData.name, 
      formData.brand, 
      formData.additionalDetails
    );

    if (suggestion) {
      setFormData(prev => ({
        ...prev,
        description: suggestion.description,
        // Simple mapping logic - could be more robust
        category: Object.values(ProductCategory).includes(suggestion.suggestedCategory as ProductCategory) 
          ? suggestion.suggestedCategory as ProductCategory 
          : ProductCategory.OTRO
      }));
    }
    
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newProduct: Product = {
      id: Date.now().toString(),
      storeId,
      name: formData.name,
      brand: formData.brand || 'Genérico',
      price: parseFloat(formData.price),
      currency: formData.currency,
      size: formData.size || 'Única',
      category: formData.category,
      description: formData.description,
      imageUrl: imagePreview || undefined,
      createdAt: Date.now(),
    };

    // Simulate network delay
    setTimeout(() => {
      saveProduct(newProduct);
      setIsLoading(false);
      onProductAdded();
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Publicar Nuevo Producto</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto del Producto</label>
            <div className="relative aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs text-gray-500">Clic para subir imagen</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              {imagePreview && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">Cambiar Imagen</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  placeholder="Ej. Camisa Oxford Azul"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  placeholder="Ej. Nike, Zara"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <div className="flex">
                  <div className="relative">
                     <select
                        value={formData.currency}
                        onChange={e => setFormData({...formData, currency: e.target.value as 'USD' | 'NIO'})}
                        className="h-full px-3 py-2 bg-gray-50 border border-gray-300 border-r-0 rounded-l-lg text-sm font-medium text-gray-700 focus:ring-0 focus:border-gray-300 outline-none appearance-none pr-8 cursor-pointer"
                     >
                        <option value="USD">USD $</option>
                        <option value="NIO">C$</option>
                     </select>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-primary focus:border-primary outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Talla / Tamaño</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={e => setFormData({...formData, size: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  placeholder="S, M, 42, Única"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white"
                >
                  {Object.values(ProductCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Section */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-indigo-900">Asistente de Ventas IA</label>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !formData.name}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                  {isGenerating ? 'Generando...' : 'Generar Descripción'}
                </button>
              </div>
              
              <p className="text-xs text-indigo-600 mb-3">
                Escribe detalles simples abajo (ej: "rojo, algodón, casual") y presiona Generar para crear una descripción profesional.
              </p>

              <textarea
                value={formData.additionalDetails}
                onChange={e => setFormData({...formData, additionalDetails: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-3"
                placeholder="Detalles rápidos: color, material, ocasión de uso..."
                rows={2}
              />

              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Final</label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none resize-none"
                rows={4}
                placeholder="Descripción detallada del producto..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Publicar Producto
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};