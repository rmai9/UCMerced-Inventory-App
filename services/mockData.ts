import { Product, AreaData, CountUnit, InventoryLineItem, Building, InventoryData } from '../types';

/**
 * MASTER_PRODUCT_LIST
 * A comprehensive list of all possible products that can be included in an inventory.
 * This serves as the single source of truth for product information.
 */
export const MASTER_PRODUCT_LIST: Product[] = [
  { id: 'prod-001', supplier: 'Sysco', brand: 'Prime Meats', productName: 'Ribeye Steak', sku: 'SKU-5832', packageSize: '12 x 16oz', productsPerCase: 12, caseWeight: 20, casePrice: 240.00, eachPrice: 20.00 },
  { id: 'prod-002', supplier: 'Sysco', brand: 'Portico', productName: 'Salmon Fillet', sku: 'SKU-9543', packageSize: '20 x 8oz', productsPerCase: 20, caseWeight: 15, casePrice: 180.00, eachPrice: 9.00 },
  { id: 'prod-003', supplier: 'US Foods', brand: 'Cross Valley', productName: 'Russet Potatoes', sku: 'SKU-1023', packageSize: '1 x 50lb bag', productsPerCase: 1, caseWeight: 50, casePrice: 45.00, eachPrice: 45.00 },
  { id: 'prod-004', supplier: 'US Foods', brand: 'Chef\'s Line', productName: 'All-Purpose Flour', sku: 'SKU-7894', packageSize: '1 x 50lb bag', productsPerCase: 1, caseWeight: 50, casePrice: 30.00, eachPrice: 30.00 },
  { id: 'prod-005', supplier: 'Local Farms', brand: 'Green Fields', productName: 'Organic Romaine', sku: 'SKU-4567', packageSize: '24 ct', productsPerCase: 24, caseWeight: 18, casePrice: 50.00, eachPrice: 2.08 },
  { id: 'prod-006', supplier: 'Sysco', brand: 'Wholesome Farms', productName: 'Heavy Cream', sku: 'SKU-1122', packageSize: '12 x 1qt', productsPerCase: 12, caseWeight: 25, casePrice: 96.00, eachPrice: 8.00 },
  { id: 'prod-007', supplier: 'US Foods', brand: 'Rykoff Sexton', productName: 'Canola Oil', sku: 'SKU-3344', packageSize: '3 x 1gal', productsPerCase: 3, caseWeight: 35, casePrice: 75.00, eachPrice: 25.00 },
  { id: 'prod-008', supplier: 'Sysco', brand: 'Arrezzio', productName: 'Pasta - Spaghetti', sku: 'SKU-5566', packageSize: '20 x 1lb', productsPerCase: 20, caseWeight: 20, casePrice: 40.00, eachPrice: 2.00 },
];

/**
 * BUILDINGS
 * A list of all buildings where inventory can be tracked.
 */
export const BUILDINGS: Building[] = [
  { id: 'bldg-1', name: 'Yablokoff-Wallace Dining Center' },
  { id: 'bldg-2', name: 'Pavilion' },
  { id: 'bldg-3', name: 'Catering' },
];

/**
 * A helper function to create a new inventory line item from a master product,
 * initializing its count to zero.
 * @param product The product from the master list.
 * @returns An InventoryLineItem object ready for an inventory sheet.
 */
const createInitialItem = (product: Product): InventoryLineItem => ({
  ...product,
  count: 0,
  countUnit: CountUnit.Case,
});

/**
 * A helper function to get the current date as a string in 'YYYY-MM-DD' format.
 * This is used to key inventory data by date.
 * Ensures timezone-safe date retrieval based on user's local time.
 * @returns The formatted date string.
 */
const getTodayDateString = () => {
    const today = new Date();
    // Use timezone offset to prevent UTC conversion from changing the date
    const offset = today.getTimezoneOffset();
    const todayLocal = new Date(today.getTime() - (offset*60*1000));
    return todayLocal.toISOString().split('T')[0];
}

/**
 * INITIAL_INVENTORY_DATA
 * The default state of the inventory data for the application.
 * This provides a starting point for new users or when local storage is empty.
 * It's structured by building ID, then by today's date, containing an array of storage areas.
 */
export const INITIAL_INVENTORY_DATA: InventoryData = {
  [BUILDINGS[0].id]: {
    [getTodayDateString()]: [ // Yablokoff-Wallace
      {
        id: 'area-1',
        name: 'Main Freezer',
        items: [
          createInitialItem(MASTER_PRODUCT_LIST[0]),
          createInitialItem(MASTER_PRODUCT_LIST[1]),
        ],
      },
      {
        id: 'area-2',
        name: 'Walk-In Cooler',
        items: [
          createInitialItem(MASTER_PRODUCT_LIST[4]),
          createInitialItem(MASTER_PRODUCT_LIST[5]),
        ],
      },
      {
        id: 'area-3',
        name: 'Dry Storage',
        items: [
          createInitialItem(MASTER_PRODUCT_LIST[2]),
          createInitialItem(MASTER_PRODUCT_LIST[3]),
          createInitialItem(MASTER_PRODUCT_LIST[6]),
          createInitialItem(MASTER_PRODUCT_LIST[7]),
        ],
      },
    ]
  },
  [BUILDINGS[1].id]: {
    [getTodayDateString()]:[ // Pavilion
      {
        id: 'area-4',
        name: 'Pavilion Cooler',
        items: [
          createInitialItem(MASTER_PRODUCT_LIST[5]),
        ],
      },
      {
        id: 'area-5',
        name: 'Pavilion Dry Stock',
        items: [
          createInitialItem(MASTER_PRODUCT_LIST[7]),
        ],
      },
    ]
  },
  [BUILDINGS[2].id]: {
    [getTodayDateString()]: [ // Catering
      {
        id: 'area-6',
        name: 'Catering Hot Hold',
        items: [],
      },
      {
        id: 'area-7',
        name: 'Catering Cold Hold',
        items: [
          createInitialItem(MASTER_PRODUCT_LIST[0]),
          createInitialItem(MASTER_PRODUCT_LIST[4]),
        ],
      },
    ]
  },
};
