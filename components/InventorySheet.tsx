import React from 'react';
import { AreaData, InventoryLineItem, CountUnit } from '../types';
import InventoryItemRow from './InventoryItemRow';
import { CalendarIcon, DollarSignIcon } from './icons';

interface InventorySheetProps {
  areaData: AreaData;
  displayDate: string;
  onItemUpdate: (itemId: string, updatedFields: Partial<Omit<InventoryLineItem, 'id'>>) => void;
}

const InventorySheet: React.FC<InventorySheetProps> = ({ areaData, displayDate, onItemUpdate }) => {
  const areaTotalPrice = areaData.items.reduce((total, item) => {
    const itemPrice = item.countUnit === CountUnit.Case ? item.casePrice : item.eachPrice;
    return total + item.count * itemPrice;
  }, 0);

  const formattedDate = new Date(`${displayDate}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                  <h1 className="text-3xl font-bold text-dark tracking-tight">{areaData.name}</h1>
                  <div className="flex items-center text-gray-500 mt-2">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <span>{formattedDate}</span>
                  </div>
              </div>
              <div className="bg-light text-dark rounded-lg p-4 text-right w-full sm:w-auto flex-shrink-0">
                  <p className="text-sm font-medium uppercase tracking-wider">Area Total Value</p>
                  <p className="text-3xl font-bold flex items-center justify-end">
                      <DollarSignIcon className="h-7 w-7 mr-1" />
                      {formatCurrency(areaTotalPrice).replace('$', '')}
                  </p>
              </div>
          </div>
        </div>
        
        {areaData.items.length > 0 ? (
          <div className="md:table w-full border-collapse">
              <div className="hidden md:table-header-group">
                  <div className="table-row">
                      <th className="table-cell text-left text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Company</th>
                      <th className="table-cell text-left text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Brand</th>
                      <th className="table-cell text-left text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Description</th>
                      <th className="table-cell text-left text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Item #</th>
                      <th className="table-cell text-center text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Case Qty</th>
                      <th className="table-cell text-center text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Package</th>
                      <th className="table-cell text-right text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Case Price</th>
                      <th className="table-cell text-right text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Ea. Price</th>
                      <th className="table-cell text-right text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Total Cost</th>
                      <th className="table-cell text-left text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Count</th>
                      <th className="table-cell text-left text-sm font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 bg-gray-50 border-b-2 border-gray-200">Count as</th>
                  </div>
              </div>
              <div className="md:table-row-group">
                  {areaData.items.map(item => (
                      <InventoryItemRow
                          key={item.id}
                          item={item}
                          onUpdate={(updatedFields) => onItemUpdate(item.id, updatedFields)}
                      />
                  ))}
              </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No items in this area yet.</p>
              <p className="text-sm text-gray-400 mt-1">Use the search bar above to add products.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventorySheet;