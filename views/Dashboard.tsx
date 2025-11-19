import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductCategory } from '../types';
import { getProducts, deleteProduct } from '../services/storageService';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, PackageOpen } from 'lucide-react';

interface DashboardProps {
  refreshTrigger: number; // Used to force reload when product is added
  onSelectProduct?: (product: Product) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ refreshTrigger, onSelectProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  useEffect(() => {
    setProducts(getProducts());
  }, [refreshTrigger]);

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      deleteProduct(id);
      setProducts(getProducts());
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-8">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Productos</h1>
          <p className="text-gray-500 text-sm mt-1">
             {products.length} {products.length === 1 ? 'producto publicado' : 'productos publicados'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Todos">Todas las Categorías</option>
              {Object.values(ProductCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="h-full">
              <ProductCard 
                product={product} 
                onDelete={handleDelete} 
                onSelect={onSelectProduct}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <PackageOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No se encontraron productos</h3>
          <p className="text-gray-500 mt-1 max-w-xs mx-auto">
            {searchTerm || selectedCategory !== 'Todos' 
              ? 'Intenta ajustar tus filtros de búsqueda.' 
              : 'Empieza publicando tu primer producto desde el menú.'}
          </p>
        </div>
      )}
    </div>
  );
};