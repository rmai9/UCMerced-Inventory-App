export enum CountUnit {
  Case = 'case',
  Each = 'each',
}

/**
 * Represents a single product in the master list.
 * This is the base data for any inventory item.
 */
export interface Product {
  id: string;
  supplier: string;
  brand: string;
  productName: string;
  sku: string;
  packageSize: string;
  productsPerCase: number;
  caseWeight: number;
  casePrice: number;
  eachPrice: number;
}

/**
 * Represents a product as an item within an inventory sheet.
 * It extends the base Product with inventory-specific details like count.
 */
export interface InventoryLineItem extends Product {
  count: number;
  countUnit: CountUnit;
}

/**
 * Represents a specific storage area (e.g., "Main Freezer")
 * and contains the list of inventory items within it.
 */
export interface AreaData {
  id:string;
  name: string;
  items: InventoryLineItem[];
}

/**
 * Represents a physical building where inventory is tracked.
 */
export interface Building {
  id: string;
  name: string;
}

/**
 * The main data structure for the entire application.
 * It's a nested object organizing inventory data by building, then by date.
 * The date is a string in 'YYYY-MM-DD' format.
 */
export interface InventoryData {
  [buildingId: string]: {
    [date: string]: AreaData[]; // Date string in 'YYYY-MM-DD' format
  };
}
