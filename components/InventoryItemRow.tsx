import React from 'react';
import { InventoryLineItem, CountUnit } from '../types';

interface InventoryItemRowProps {
  item: InventoryLineItem;
  onUpdate: (updatedFields: Partial<Omit<InventoryLineItem, 'id'>>) => void;
}

const UnitToggle: React.FC<{ value: CountUnit; onChange: (newValue: CountUnit) => void }> = ({ value, onChange }) => (
    <div className="flex items-center bg-gray-200 rounded-full p-1 w-min" role="group">
      <button
        type="button"
        aria-pressed={value === CountUnit.Case}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${value === CountUnit.Case ? 'bg-white shadow' : 'text-gray-600'}`}
        onClick={() => onChange(CountUnit.Case)}
      >
        Case
      </button>
      <button
        type="button"
        aria-pressed={value === CountUnit.Each}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${value === CountUnit.Each ? 'bg-white shadow' : 'text-gray-600'}`}
        onClick={() => onChange(CountUnit.Each)}
      >
        Each
      </button>
    </div>
);


const InventoryItemRow: React.FC<InventoryItemRowProps> = ({ item, onUpdate }) => {
  const totalPrice = item.countUnit === CountUnit.Case
    ? item.count * item.casePrice
    : item.count * item.eachPrice;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <>
      {/* --- Desktop View: Render as a table row --- */}
      <div className="hidden md:table-row align-middle w-full bg-white hover:bg-gray-50 transition-colors">
        <div className="md:table-cell px-6 py-4 align-middle text-sm text-gray-800 font-medium border-b border-gray-200">{item.supplier}</div>
        <div className="md:table-cell px-6 py-4 align-middle text-sm font-semibold text-gray-900 border-b border-gray-200">{item.brand}</div>
        <div className="md:table-cell px-6 py-4 align-middle text-sm font-semibold text-gray-900 border-b border-gray-200">{item.productName}</div>
        <div className="md:table-cell px-6 py-4 align-middle text-sm text-gray-600 border-b border-gray-200">{item.sku}</div>
        <div className="md:table-cell px-6 py-4 align-middle text-sm text-gray-800 text-center border-b border-gray-200">{item.productsPerCase}</div>
        <div className="md:table-cell px-6 py-4 align-middle text-sm text-gray-800 text-center border-b border-gray-200">{item.packageSize}</div>
        <div className="md:table-cell px-6 py-4 align-middle text-sm text-gray-800 text-right border-b border-gray-200">{formatCurrency(item.casePrice)}</div>
        <div className="md:table-cell px-6 py-4 align-middle text-sm text-gray-800 text-right border-b border-gray-200">{formatCurrency(item.eachPrice)}</div>
        <div className="md:table-cell px-6 py-4 align-middle text-sm font-bold text-secondary text-right border-b border-gray-200">{formatCurrency(totalPrice)}</div>
        <div className="md:table-cell px-6 py-4 align-middle border-b border-gray-200">
            <input
              type="number"
              value={item.count}
              onChange={(e) => onUpdate({ count: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-24 p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary text-sm text-right"
              placeholder="0"
              aria-label={`Count for ${item.productName}`}
            />
        </div>
        <div className="md:table-cell px-6 py-4 align-middle border-b border-gray-200">
            <UnitToggle value={item.countUnit} onChange={(unit) => onUpdate({ countUnit: unit })} />
        </div>
      </div>

      {/* --- Mobile View: Render as a card --- */}
      <div className="md:hidden bg-white rounded-lg shadow-md mb-4 p-4">
        <div className="mb-4 border-b pb-3">
            <p className="font-bold text-lg text-dark">{item.productName}</p>
            <p className="text-sm text-gray-500">{item.brand} - SKU: {item.sku}</p>
        </div>

        <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-3 items-center">
            <div className="text-sm font-medium text-gray-500 text-left">Company</div>
            <div className="text-sm text-gray-800 font-medium text-right">{item.supplier}</div>
            
            <div className="text-sm font-medium text-gray-500 text-left">Case Qty</div>
            <div className="text-sm text-gray-800 text-right">{item.productsPerCase}</div>

            <div className="text-sm font-medium text-gray-500 text-left">Package</div>
            <div className="text-sm text-gray-800 text-right">{item.packageSize}</div>

            <div className="text-sm font-medium text-gray-500 text-left">Case Price</div>
            <div className="text-sm text-gray-800 text-right">{formatCurrency(item.casePrice)}</div>

            <div className="text-sm font-medium text-gray-500 text-left">Ea. Price</div>
            <div className="text-sm text-gray-800 text-right">{formatCurrency(item.eachPrice)}</div>

            <div className="text-sm font-medium text-gray-500 text-left">Total Cost</div>
            <div className="text-sm font-bold text-secondary text-right">{formatCurrency(totalPrice)}</div>
        </div>
        
        <div className="mt-4 pt-4 border-t flex items-center justify-between gap-4">
             <label htmlFor={`count-${item.id}`} className="text-sm font-medium text-gray-700 flex-shrink-0">Enter Count:</label>
             <div className="flex items-center gap-2">
                <input
                    id={`count-${item.id}`}
                    type="number"
                    value={item.count}
                    onChange={(e) => onUpdate({ count: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-24 p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary text-sm text-right"
                    placeholder="0"
                />
                <UnitToggle value={item.countUnit} onChange={(unit) => onUpdate({ countUnit: unit })} />
            </div>
        </div>
      </div>
    </>
  );
};

export default InventoryItemRow;