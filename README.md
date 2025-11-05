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
8. [Deployment](#deployment)
9. [Potential Future Improvements](#potential-future-improvements)

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
- **Deployment Transpilation**: Babel Standalone

The application is built as a single-page application (SPA) and runs entirely in the client's browser. It uses an `importmap` in `index.html` to load React dependencies from a CDN, requiring no local build step.

## Project Structure

The codebase is organized to separate concerns, making it easier to navigate and maintain.

```
/
├── components/
├── services/
├── utils/
├── _headers                     # Netlify configuration file
├── App.tsx
├── index.html                   # Main HTML file, loads scripts and Tailwind CSS
├── index.tsx
├── README.md                    # This documentation file
├── metadata.json                # Application metadata
└── types.ts
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

All data mutations (updating an item's count, adding a new area, editing a master product) are handled by functions within `App.tsx`. This centralized approach ensures data consistency.

### Data Persistence

The application uses the browser's `localStorage` to persist data.
- Two `useEffect` hooks in `App.tsx` monitor the `inventoryData` and `masterProductList` states.
- Whenever either of these states changes, the hook stringifies the data and saves it to `localStorage`.
- When the app initializes, it attempts to load this data from `localStorage`, falling back to the `INITIAL_INVENTORY_DATA` from `mockData.ts` if nothing is found.

## Component Breakdown

(Component breakdown remains the same as previous versions)

## Key Functionalities Explained

(Key functionalities remain the same as previous versions)

## Deployment

This application is configured to run without a traditional build step, which is great for simplicity but requires specific configuration for deployment on static hosting services like Netlify. The "white screen" issue on deployment is caused by two separate problems that must be solved.

### Problem 1: Invalid `importmap` (Client-Side Error)

The browser needs to know where to download the React library. The `importmap` in `index.html` tells it how. An incorrect or ambiguous `importmap` will cause a fatal JavaScript error before the app can load.

**Solution**: Ensure the `importmap` is clean and provides a single, unambiguous source for React modules. Conflicting entries must be removed.

```html
<!-- Correct, simple importmap -->
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@...",
    "react-dom/client": "https://esm.sh/react-dom@.../client"
  }
}
</script>
```

### Problem 2: Incorrect MIME Types (Server-Side Error)

Browsers will not execute scripts (`.js`, `.tsx`) for security reasons if they are not served from the server with a correct JavaScript `Content-Type` header (e.g., `text/javascript`). By default, a static host like Netlify doesn't know what a `.tsx` file is and will serve it as plain text, which the browser will block from running.

**Solution**: You must add a configuration file to tell the hosting provider how to serve these files. For Netlify, this is a `_headers` file placed in the root of your project.

```
# _headers file content
/*.ts
  Content-Type: text/javascript
/*.tsx
  Content-Type: text/javascript
```

This file instructs Netlify to serve all `.ts` and `.tsx` files with the correct header, allowing the browser to execute your application code.

With both of these issues resolved, you can deploy the entire source code directory directly to Netlify.

*Note on Babel Warning*: You will see a warning in the browser console about using the in-browser Babel transformer in production. This is expected and is not an error. For optimal performance, a real-world application would use a build tool like Vite or Create React App to pre-compile the code before deployment. However, for this project's setup, the in-browser transformer is required and works correctly.

## Potential Future Improvements

- **State Management**: To eliminate prop drilling and improve scalability, the state could be migrated to a dedicated library like Zustand, Jotai, or Redux Toolkit.
- **Backend Integration**: Replace `localStorage` with a proper backend service and database (e.g., Firebase, Supabase) to enable multi-user collaboration and data backups.
- **Performance**: For very large inventories, using a library like Immer for immutable updates would be more performant than the current deep-cloning method.
- **Build Step**: Integrate a build tool like Vite to pre-compile TypeScript/JSX, which improves production performance and removes the need for in-browser transpilation and the associated console warning.
- **Testing**: Implement a testing suite with Jest and React Testing Library to ensure code reliability.
- **UI/UX Enhancements**: Add features like drag-and-drop reordering, bulk editing, and more sophisticated data visualization.