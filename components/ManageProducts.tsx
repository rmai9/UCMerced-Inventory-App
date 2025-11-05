import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { EditIcon, TrashIcon, SearchIcon } from './icons';

interface ManageProductsProps {
  masterProductList: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const ManageProducts: React.FC<ManageProductsProps> = ({ masterProductList, onEditProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return masterProductList;
    const lowercasedTerm = searchTerm.toLowerCase();
    return masterProductList.filter(product =>
      product.productName.toLowerCase().includes(lowercasedTerm) ||
      product.sku.toLowerCase().includes(lowercasedTerm) ||
      product.brand.toLowerCase().includes(lowercasedTerm) ||
      product.supplier.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, masterProductList]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-dark tracking-tight">Manage Master Product List</h1>
          <div className="relative w-full md:w-1/3">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Case Price</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Each Price</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-light transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                    <div className="text-sm text-gray-500">{product.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.supplier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">{formatCurrency(product.casePrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">{formatCurrency(product.eachPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-4">
                      <button onClick={() => onEditProduct(product)} className="text-secondary hover:text-dark transition-colors" aria-label={`Edit ${product.productName}`}>
                        <EditIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => onDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 transition-colors" aria-label={`Delete ${product.productName}`}>
                        <TrashIcon className="w-5 h-5"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
             <div className="text-center py-12">
                <p className="text-gray-500">No products match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
