import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { SearchIcon, PlusIcon } from './icons';

interface SearchBarProps {
  masterProductList: Product[];
  currentItems: Product[];
  onAddItem: (product: Product) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ masterProductList, currentItems, onAddItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const currentItemIds = useMemo(() => new Set(currentItems.map(item => item.id)), [currentItems]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return masterProductList.filter(product =>
      !currentItemIds.has(product.id) &&
      (product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, masterProductList, currentItemIds]);

  const handleAddItem = (product: Product) => {
    onAddItem(product);
    setSearchTerm('');
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} // delay to allow click on results
          placeholder="Search for a product by name, SKU, or brand..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-secondary focus:border-secondary transition"
        />
      </div>

      {isFocused && searchTerm && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto overscroll-contain">
          {filteredProducts.length > 0 ? (
            <ul>
              {filteredProducts.map(product => (
                <li key={product.id}>
                  <button
                    onClick={() => handleAddItem(product)}
                    className="w-full text-left px-4 py-3 hover:bg-light transition duration-150"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{product.productName}</p>
                        <p className="text-sm text-gray-500">{product.brand} - SKU: {product.sku}</p>
                      </div>
                      <PlusIcon className="h-5 w-5 text-secondary" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
