# UC Merced Inventory Tracker

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Technical Stack](#technical-stack)
4. [Project Structure](#project-structure)
5. [Core Concepts & State Management](#core-concepts--state-management)
    - [Main Data Structure (`InventoryData`)](#main-data-structure-inventorydata)
    - [Master Product List](#master-product-list)
    - [State Management in `App.tsx`](#state-management-in-apptsx)
    - [Data Persistence](#data-persistence)
6. [Component Breakdown](#component-breakdown)
7. [Key Functionalities Explained](#key-functionalities-explained)
    - [Date Handling & Templating](#date-handling--templating)
    - [Excel Export](#excel-export)
    - [Excel Import](#excel-import)
8. [Potential Future Improvements](#potential-future-improvements)

---

## Overview

The UC Merced Inventory Tracker is a web-based application designed to streamline the process of tracking inventory across multiple campus locations (buildings). It allows users to manage a master list of products, conduct inventory counts for different storage areas, and save this data on a per-day basis. The application is fully responsive and includes robust import/export functionality using Excel files.

## Features

- **Multi-Building & Multi-Date Management**: Track inventory for different buildings, with data saved uniquely for each day.
- **Dynamic Inventory Sheets**: View and manage inventory organized by customizable storage areas (e.g., "Main Freezer", "Dry Storage").
- **Master Product Management**: A central view to add, edit, and delete products from the master list. Changes are propagated throughout all historical inventory records.
- **Real-time Product Search**: Quickly find and add products to an inventory sheet from the master list.
- **Responsive Design**: A seamless experience on both desktop and mobile devices, with layouts optimized for different screen sizes.
- **Excel Import/Export**:
    - **Export**: Generate a formatted Excel workbook of the current day's inventory, with each storage area in a separate sheet.
    - **Import**: Parse a specially formatted Excel file to populate an entire day's inventory, automatically creating new products in the master list if they don't exist.
- **Client-Side Persistence**: All data is saved in the browser's `localStorage`, allowing users to close the tab and resume their work later.
- **Theming**: Switch between multiple color themes to personalize the user interface.

## Technical Stack

- **Frontend Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Excel Operations**: SheetJS (XLSX) library

The application is built as a single-page application (SPA) and runs entirely in the client's browser. It uses an `importmap` in `index.html` to load React dependencies from a CDN, requiring no local build step.

## Project Structure

The codebase is organized to separate concerns, making it easier to navigate and maintain.

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── AddProductModal.tsx      # Modal for adding/editing master products
│   │   ├── AreaSidebar.tsx          # Lists, adds, and edits storage areas
│   │   ├── EmailExportModal.tsx     # Modal for handling the export flow
│   │   ├── icons.tsx                # SVG icon components
│   │   ├── InventoryItemRow.tsx     # A single row/card in the inventory sheet
│   │   ├── InventorySheet.tsx       # The main table/view for an area's inventory
│   │   ├── ManageProducts.tsx       # View for managing the master product list
│   │   ├── SearchBar.tsx            # Component to search and add products
│   │   └── ThemeSwitcher.tsx        # UI for changing color themes
│   │
│   ├── services/
│   │   └── mockData.ts              # Initial data for products and inventory structure
│   │
│   ├── utils/
│   │   └── themes.ts                # Theme definitions
│   │
│   ├── App.tsx                      # Root component, manages all application state
│   ├── index.tsx                    # React application entry point
│   └── types.ts                     # Centralized TypeScript type definitions
│
├── index.html                       # Main HTML file, loads scripts and Tailwind CSS
├── README.md                        # This documentation file
└── metadata.json                    # Application metadata
```

## Core Concepts & State Management

### Main Data Structure (`InventoryData`)

The core of the application's data is the `InventoryData` object. It's a nested structure designed for efficient lookups by building and date.

```typescript
interface InventoryData {
  [buildingId: string]: {
    [date: string]: AreaData[]; // Date string in 'YYYY-MM-DD' format
  };
}
```
- The first level is keyed by `buildingId`.
- The second level is keyed by a date string (`YYYY-MM-DD`).
- The value is an array of `AreaData` objects, where each object represents a storage area and contains its list of `InventoryLineItem`s.

This structure allows the app to easily retrieve all storage areas for a specific building on a specific day.

### Master Product List

A separate `Product[]` array, `masterProductList`, serves as the single source of truth for all product information (SKU, brand, price, etc.). When a product is added to an inventory sheet, its static data is copied from this master list, and inventory-specific properties (`count`, `countUnit`) are added.

### State Management in `App.tsx`

The `App.tsx` component is the brain of the application. It holds all major state variables and passes data and handler functions down to child components via props.

- `inventoryData`: The main data object described above.
- `masterProductList`: The master list of all available products.
- `activeBuildingId`, `selectedDate`, `activeAreaId`: State variables that track the user's current context, determining what data is displayed.

All data mutations (updating an item's count, adding a new area, editing a master product) are handled by functions within `App.tsx`. This centralized approach ensures data consistency, though for larger applications, a dedicated state management library might be preferable to mitigate prop drilling.

### Data Persistence

The application uses the browser's `localStorage` to persist data.
- Two `useEffect` hooks in `App.tsx` monitor the `inventoryData` and `masterProductList` states.
- Whenever either of these states changes, the hook stringifies the data and saves it to `localStorage`.
- When the app initializes, it attempts to load this data from `localStorage`, falling back to the `INITIAL_INVENTORY_DATA` from `mockData.ts` if nothing is found.

## Component Breakdown

- **`App.tsx`**: The main container. Manages state, handles data logic, and renders either the inventory view or the product management view.
- **`InventorySheet.tsx`**: Displays the inventory for a single selected area. It includes a header with the area's total value and renders a list of `InventoryItemRow` components.
- **`InventoryItemRow.tsx`**: Represents a single product in the inventory. It's responsive, showing as a table row on desktop and a card on mobile. It contains the inputs for updating an item's count and count unit.
- **`AreaSidebar.tsx`**: A navigation component for switching between storage areas. It also contains the UI for adding new areas and renaming existing ones.
- **`SearchBar.tsx`**: Allows users to search the `masterProductList` for products that are not already in the current area and add them.
- **`ManageProducts.tsx`**: A full-page component that displays the `masterProductList` in a searchable table, with buttons to trigger editing or deletion of products.
- **`AddProductModal.tsx`**: A modal form used for both creating new products and editing existing ones in the master list. It automatically calculates the "each price" from the case price.
- **`EmailExportModal.tsx`**: A modal that orchestrates the export process, providing options to download the file directly or open a pre-filled `mailto:` link.

## Key Functionalities Explained

### Date Handling & Templating

When a user selects a date in the date picker for a given building, the app checks if inventory data already exists for that day.
- **If it exists**, the data is loaded and displayed.
- **If it does not exist**, the app automatically creates a new inventory sheet for that day. It does this by finding the most recent existing inventory for that building, copying its structure (all areas and the items within them), and resetting all item counts to zero. This provides a convenient template for the user to start their new count.

### Excel Export

The export functionality is triggered from the header.
1. It retrieves the inventory data for the currently selected building and date (`areasForSelectedDate`).
2. It initializes a new workbook using SheetJS.
3. It iterates through each `AreaData` object. For each area, it:
    - Creates a new worksheet.
    - Defines a header row.
    - Maps the `items` array to rows, calculating the total cost for each item.
    - Sets column widths and applies currency formatting to relevant cells.
    - Appends the worksheet to the workbook, using a truncated area name as the sheet name.
4. Finally, it triggers a browser download of the generated `.xlsx` file.

### Excel Import

The import logic is the most complex piece of functionality in the application.
1. **File Reading**: The user selects an Excel file, which is read by the `FileReader` API.
2. **Finding the "Totals" Sheet**: The import format requires a sheet containing the word "Total". This sheet is parsed first to determine the **correct order and names** of all storage areas. This is crucial for rebuilding the inventory structure accurately.
3. **Initializing Data Structures**: An ordered map of new `AreaData` objects is created based on the names extracted from the "Totals" sheet.
4. **Parsing Data Sheets**: The function then iterates through all other sheets in the workbook.
    - It finds the header row (e.g., `['Company', 'Brand', ...]`) to know where the item data begins.
    - It reads each subsequent row, parsing values for SKU, description, prices, count, etc.
5. **Product Reconciliation**: For each parsed item row:
    - It checks if a product with the given SKU exists in the `masterProductList`.
    - **If it exists**, that product's data is used.
    - **If it does not exist**, a new product is created on-the-fly and added to a temporary copy of the master list.
6. **State Update**: Once all sheets are parsed, the application's state is updated:
    - The `masterProductList` is updated with any newly discovered products.
    - The `inventoryData` for the selected building and date is replaced entirely with the newly constructed array of `AreaData`.

## Potential Future Improvements

- **State Management**: To eliminate prop drilling and improve scalability, the state could be migrated to a dedicated library like Zustand, Jotai, or Redux Toolkit. A React Context could also be a simpler intermediate step.
- **Backend Integration**: Replace `localStorage` with a proper backend service and database (e.g., Firebase, Supabase, or a custom Node.js/Express API). This would enable multi-user collaboration, data backups, and user authentication.
- **Performance**: For very large inventories, the deep-cloning operations used when updating/deleting master products (`JSON.parse(JSON.stringify(...))`) could become a bottleneck. Using a library like Immer would allow for safer and more performant immutable updates.
- **Testing**: Implement a testing suite with Jest and React Testing Library to add unit and integration tests, ensuring code reliability and preventing regressions.
- **UI/UX Enhancements**: Add features like drag-and-drop reordering of items or areas, bulk editing capabilities, and more sophisticated data visualization or reporting.
