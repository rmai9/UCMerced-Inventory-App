import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { CloseIcon, PlusIcon } from './icons';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  productToEdit: Product | null;
}

/**
 * A generic input field component for the modal form.
 */
const InputField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary transition text-base" />
    </div>
);

// Initial empty state for the product form.
const emptyProductState = {
  supplier: '',
  brand: '',
  productName: '',
  sku: '',
  packageSize: '',
  productsPerCase: 1,
  casePrice: 0,
};

/**
 * A modal component for adding a new product to the master list or editing an existing one.
 * The behavior (add vs. edit) is determined by the `productToEdit` prop.
 */
const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onAddProduct, onUpdateProduct, productToEdit }) => {
  // State to hold the form data for the product.
  const [product, setProduct] = useState(emptyProductState);

  // Determines if the modal is in "editing" mode.
  const isEditing = useMemo(() => !!productToEdit, [productToEdit]);

  // Effect to populate the form with product data when editing, or reset it when adding.
  // This runs when the modal is opened or the product to edit changes.
  useEffect(() => {
    if (isOpen && productToEdit) {
      setProduct({
        supplier: productToEdit.supplier,
        brand: productToEdit.brand,
        productName: productToEdit.productName,
        sku: productToEdit.sku,
        packageSize: productToEdit.packageSize,
        productsPerCase: productToEdit.productsPerCase,
        casePrice: productToEdit.casePrice,
      });
    } else {
      // Reset to empty state if not editing or modal is closed.
      setProduct(emptyProductState);
    }
  }, [isOpen, productToEdit]);

  // Memoized calculation for the 'each price' based on case price and quantity.
  const eachPrice = useMemo(() => {
    const casePrice = Number(product.casePrice) || 0;
    const perCase = Number(product.productsPerCase) || 1;
    if (perCase > 0) {
      return (casePrice / perCase).toFixed(2);
    }
    return '0.00';
  }, [product.casePrice, product.productsPerCase]);

  /**
   * Handles changes to form input fields, updating the component's state.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumber = ['productsPerCase', 'casePrice'].includes(name);
    setProduct(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  /**
   * Handles form submission, calling either the onUpdateProduct or onAddProduct prop.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && productToEdit) {
      onUpdateProduct({
        ...productToEdit,
        ...product,
        eachPrice: parseFloat(eachPrice),
      });
    } else {
      onAddProduct({ ...product, eachPrice: parseFloat(eachPrice), caseWeight: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-dark">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200" aria-label="Close modal">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <InputField label="Supplier" id="supplier" name="supplier" type="text" value={product.supplier} onChange={handleChange} required />
                <InputField label="Brand" id="brand" name="brand" type="text" value={product.brand} onChange={handleChange} required />
                <InputField label="Product Name" id="productName" name="productName" type="text" value={product.productName} onChange={handleChange} required />
                <InputField label="SKU" id="sku" name="sku" type="text" value={product.sku} onChange={handleChange} required />
                <InputField label="Package Size (e.g., 12 x 16oz)" id="packageSize" name="packageSize" type="text" value={product.packageSize} onChange={handleChange} required />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Quantity / Case" id="productsPerCase" name="productsPerCase" type="number" min="1" step="1" value={product.productsPerCase} onChange={handleChange} required />
                    <InputField label="Case Price ($)" id="casePrice" name="casePrice" type="number" min="0" step="0.01" value={product.casePrice} onChange={handleChange} required />
                </div>
                
                <div>
                    <label htmlFor="eachPrice" className="block text-sm font-medium text-gray-700 mb-1">Each Price ($)</label>
                    <input 
                        id="eachPrice" 
                        type="text" 
                        value={eachPrice} 
                        readOnly 
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-md text-base" 
                        aria-label="Calculated each price"
                    />
                </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t rounded-b-xl flex justify-end">
                <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-text font-semibold rounded-full shadow-md hover:bg-dark transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    {isEditing ? 'Save Changes' : 'Save Product'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
