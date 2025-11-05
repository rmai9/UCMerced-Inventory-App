export enum CountUnit {
  Case = 'case',
  Each = 'each',
}

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

export interface InventoryLineItem extends Product {
  count: number;
  countUnit: CountUnit;
}

export interface AreaData {
  id:string;
  name: string;
  items: InventoryLineItem[];
}

export interface Building {
  id: string;
  name: string;
}

export interface InventoryData {
  [buildingId: string]: {
    [date: string]: AreaData[]; // Date string in 'YYYY-MM-DD' format
  };
}