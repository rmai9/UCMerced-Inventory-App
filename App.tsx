import React, { useState, useMemo, useEffect } from 'react';
import { AreaData, Product, InventoryLineItem, CountUnit, InventoryData } from './types';
import { INITIAL_INVENTORY_DATA, MASTER_PRODUCT_LIST, BUILDINGS } from './services/mockData';
import InventorySheet from './components/InventorySheet';
import SearchBar from './components/SearchBar';
import AreaSidebar from './components/AreaSidebar';
import ProductModal from './components/AddProductModal';
import EmailExportModal from './components/EmailExportModal';
import ManageProducts from './components/ManageProducts';
import { PlusIcon, ExportIcon, CalendarIcon, ImportIcon, BriefcaseIcon } from './components/icons';
import ThemeSwitcher from './components/ThemeSwitcher';
import { themes } from './utils/themes';

declare var XLSX: any;

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

type View = 'inventory' | 'manageProducts';

const App: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<InventoryData>(() => {
    const savedData = localStorage.getItem('inventoryData');
    return savedData ? JSON.parse(savedData) : INITIAL_INVENTORY_DATA;
  });
  const [masterProductList, setMasterProductList] = useState<Product[]>(() => {
    const savedList = localStorage.getItem('masterProductList');
    return savedList ? JSON.parse(savedList) : MASTER_PRODUCT_LIST;
  });
  
  const [activeBuildingId, setActiveBuildingId] = useState<string>(BUILDINGS[0].id);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeAreaId, setActiveAreaId] = useState<string>(() => {
    const initialBuildingId = BUILDINGS[0].id;
    const initialDate = getTodayDateString();
    const initialAreas = (localStorage.getItem('inventoryData') ? JSON.parse(localStorage.getItem('inventoryData')!) : INITIAL_INVENTORY_DATA)[initialBuildingId]?.[initialDate] || [];
    return initialAreas[0]?.id || '';
  });

  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('inventory-theme') || 'uc-merced');
  const [currentView, setCurrentView] = useState<View>('inventory');

  useEffect(() => {
    localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
  }, [inventoryData]);

  useEffect(() => {
    localStorage.setItem('masterProductList', JSON.stringify(masterProductList));
  }, [masterProductList]);

  useEffect(() => {
    const activeTheme = themes[theme];
    if (activeTheme) {
        const root = document.documentElement;
        Object.entries(activeTheme.colors).forEach(([key, value]) => {
            const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVarName, value);
        });
        localStorage.setItem('inventory-theme', theme);
    }
  }, [theme]);

  const areasForSelectedDate = useMemo(() => {
    return inventoryData[activeBuildingId]?.[selectedDate] || [];
  }, [inventoryData, activeBuildingId, selectedDate]);

  useEffect(() => {
    const buildingInventory = inventoryData[activeBuildingId];
    if (buildingInventory && !buildingInventory[selectedDate]) {
      const availableDates = Object.keys(buildingInventory).sort().reverse();
      const mostRecentDate = availableDates[0];
      
      if (mostRecentDate) {
        const templateAreas = buildingInventory[mostRecentDate];
        const newAreasForDate = templateAreas.map(area => ({
          ...area,
          items: area.items.map(item => ({
            ...item,
            count: 0,
          }))
        }));
        
        setInventoryData(prev => ({
          ...prev,
          [activeBuildingId]: {
            ...prev[activeBuildingId],
            [selectedDate]: newAreasForDate
          }
        }));
      }
    }
  }, [activeBuildingId, selectedDate, inventoryData]);


  useEffect(() => {
    if (!areasForSelectedDate.find(area => area.id === activeAreaId)) {
      setActiveAreaId(areasForSelectedDate[0]?.id || '');
    }
  }, [areasForSelectedDate, activeAreaId]);

  const activeArea = useMemo(() => {
    return areasForSelectedDate.find(area => area.id === activeAreaId);
  }, [areasForSelectedDate, activeAreaId]);

  const handleStateUpdateForDate = (updater: (currentAreas: AreaData[]) => AreaData[]) => {
    setInventoryData(prevData => {
      const currentBuildingData = prevData[activeBuildingId] || {};
      const currentAreas = currentBuildingData[selectedDate] || [];
      const updatedAreas = updater(currentAreas);
      return {
        ...prevData,
        [activeBuildingId]: {
          ...currentBuildingData,
          [selectedDate]: updatedAreas,
        }
      };
    });
  };

  const handleItemUpdate = (itemId: string, updatedFields: Partial<Omit<InventoryLineItem, 'id'>>) => {
    handleStateUpdateForDate(currentAreas => 
      currentAreas.map(area => {
        if (area.id === activeAreaId) {
          return {
            ...area,
            items: area.items.map(item =>
              item.id === itemId ? { ...item, ...updatedFields } : item
            ),
          };
        }
        return area;
      })
    );
  };

  const handleAddItemToSheet = (product: Product) => {
    const newItem: InventoryLineItem = { ...product, count: 0, countUnit: CountUnit.Case };
    handleStateUpdateForDate(currentAreas => 
      currentAreas.map(area => {
        if (area.id === activeAreaId && !area.items.find(item => item.id === product.id)) {
          return { ...area, items: [...area.items, newItem] };
        }
        return area;
      })
    );
  };

  const handleAddProductToMasterList = (newProduct: Omit<Product, 'id'>) => {
    const productWithId: Product = { ...newProduct, id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
    setMasterProductList(prevList => [...prevList, productWithId]);
    setProductModalOpen(false);
  };

  const handleUpdateMasterProduct = (updatedProduct: Product) => {
    setMasterProductList(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

    setInventoryData(prevInventory => {
        const newInventoryData = JSON.parse(JSON.stringify(prevInventory));
        for (const buildingId in newInventoryData) {
            for (const date in newInventoryData[buildingId]) {
                newInventoryData[buildingId][date].forEach((area: AreaData) => {
                    area.items = area.items.map((item: InventoryLineItem) => {
                        if (item.id === updatedProduct.id) {
                            return {
                                ...updatedProduct,
                                count: item.count,
                                countUnit: item.countUnit,
                            };
                        }
                        return item;
                    });
                });
            }
        }
        return newInventoryData;
    });

    setProductModalOpen(false);
    setProductToEdit(null);
  };

  const handleDeleteMasterProduct = (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product? This action is permanent and will remove the item from all inventory sheets.")) {
        return;
    }
    setMasterProductList(prev => prev.filter(p => p.id !== productId));
    setInventoryData(prevInventory => {
        const newInventoryData = JSON.parse(JSON.stringify(prevInventory));
        for (const buildingId in newInventoryData) {
            for (const date in newInventoryData[buildingId]) {
                newInventoryData[buildingId][date].forEach((area: AreaData) => {
                    area.items = area.items.filter((item: InventoryLineItem) => item.id !== productId);
                });
            }
        }
        return newInventoryData;
    });
  };

  const handleAddArea = (name: string) => {
    const newArea: AreaData = { id: `area-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, name, items: [] };
    handleStateUpdateForDate(currentAreas => [...currentAreas, newArea]);
    setActiveAreaId(newArea.id);
  };

  const handleUpdateAreaName = (areaId: string, newName: string) => {
    handleStateUpdateForDate(currentAreas => 
      currentAreas.map(area =>
        area.id === areaId ? { ...area, name: newName } : area
      )
    );
  };
  
  const generateAndDownloadExcel = (): string => {
    const buildingDataForDate = inventoryData[activeBuildingId]?.[selectedDate];
    if (!buildingDataForDate || buildingDataForDate.length === 0) {
        alert(`No data to export for this building on ${selectedDate}.`);
        return '';
    }

    const wb = XLSX.utils.book_new();
    
    buildingDataForDate.forEach(area => {
        const header = ['Company', 'Brand', 'Description', 'Item #', 'Case Qty', 'Package', 'Case Price', 'Ea. Price', 'Count', 'Total Cost', 'Count as'];
        const data = area.items.map(item => {
            const totalCost = item.countUnit === CountUnit.Case ? item.count * item.casePrice : item.count * item.eachPrice;
            return [item.supplier, item.brand, item.productName, item.sku, item.productsPerCase, item.packageSize, item.casePrice, item.eachPrice, item.count, totalCost, item.countUnit];
        });

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
        ws['!cols'] = [ {wch:20}, {wch:20}, {wch:40}, {wch:15}, {wch:10}, {wch:15}, {wch:12}, {wch:12}, {wch:10}, {wch:12}, {wch:10} ];
        const currencyFormat = '$#,##0.00';
        data.forEach((row, rowIndex) => {
            const rowNum = rowIndex + 2;
            [6, 7, 9].forEach(colIndex => {
                const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: rowNum - 1});
                if(ws[cellAddress]) ws[cellAddress].z = currencyFormat;
            });
        });
        XLSX.utils.book_append_sheet(wb, ws, area.name.substring(0, 31));
    });

    const buildingName = BUILDINGS.find(b => b.id === activeBuildingId)?.name || 'Inventory';
    const fileName = `${buildingName} Inventory - ${selectedDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
    return fileName;
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const totalsSheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('total'));
        if (!totalsSheetName) {
            alert("Could not find a 'Totals' sheet in the Excel file to determine area order.");
            return;
        }

        const totalsSheet = workbook.Sheets[totalsSheetName];
        const totalsData = XLSX.utils.sheet_to_json(totalsSheet, { header: 1 }) as string[][];
        
        const headerRowIndex = totalsData.findIndex(row => 
            row[0]?.toString().toLowerCase() === 'inventories' && 
            row[1]?.toString().toLowerCase() === 'totals'
        );

        if (headerRowIndex === -1) {
            alert("Could not find header row ('Inventories', 'Totals') in the Totals sheet.");
            return;
        }

        const areaNamesInOrder = totalsData
            .slice(headerRowIndex + 1)
            .map(row => row[0])
            .filter(name => name && name.trim() !== '' && name.toLowerCase() !== 'ending inventory');

        let newMasterList = [...masterProductList];
        const newInventoryAreasMap = new Map<string, AreaData>();
        areaNamesInOrder.forEach((name, index) => {
            newInventoryAreasMap.set(name, {
                id: `area-imported-${Date.now() + index}-${Math.random().toString(36).substring(2, 9)}`,
                name,
                items: []
            });
        });

        const areaNamesInOrderLowerCase = areaNamesInOrder.map(n => n.toLowerCase());
        const dataSheetNames = workbook.SheetNames.filter(name => !name.toLowerCase().includes('total'));

        for (const sheetName of dataSheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const sheetJson = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];

            let sheetAreaName: string | null = null;
            for(let i=0; i < 5 && i < sheetJson.length; i++) {
                const potentialName = sheetJson[i][0]?.toString();
                if(potentialName && areaNamesInOrderLowerCase.includes(potentialName.toLowerCase())) {
                    const originalIndex = areaNamesInOrderLowerCase.indexOf(potentialName.toLowerCase());
                    sheetAreaName = areaNamesInOrder[originalIndex];
                    break;
                }
            }

            if (!sheetAreaName) {
                console.warn(`Could not determine area for sheet "${sheetName}". Skipping.`);
                continue;
            }
            
            const currentArea = newInventoryAreasMap.get(sheetAreaName);
            if (!currentArea) continue;

            let itemStartIndex = sheetJson.findIndex(row => row[0]?.toString().toLowerCase() === 'company');
            if (itemStartIndex === -1) {
                console.warn(`Could not find item header in sheet "${sheetName}". Skipping items.`);
                continue;
            } 
            itemStartIndex++;

            const parseCurrency = (val: any): number => {
                if (typeof val === 'number') return val;
                if (typeof val !== 'string') return 0;
                return Number(val.replace(/[^0-9.-]+/g, "")) || 0;
            };

            for (let i = itemStartIndex; i < sheetJson.length; i++) {
                const row = sheetJson[i];
                if (row.length < 3 || row[0]?.toString().toLowerCase().startsWith('total:')) {
                    continue;
                }
                
                const [company, brand, description, itemNum, caseQty, pkg, casePrice, eaPrice, count, , countAs] = row;
                if (!itemNum || !description) continue;
                
                let product = newMasterList.find(p => p.sku === itemNum.toString());
                if (!product) {
                    const casePriceNum = parseCurrency(casePrice);
                    const eaPriceNum = parseCurrency(eaPrice);
                    const caseQtyNum = Number(caseQty) || 1;
                    const newProduct: Product = {
                        id: `prod-imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        supplier: company?.toString() || 'N/A',
                        brand: brand?.toString() || 'N/A',
                        productName: description?.toString(),
                        sku: itemNum.toString(),
                        packageSize: pkg?.toString() || 'N/A',
                        productsPerCase: caseQtyNum,
                        caseWeight: 0,
                        casePrice: casePriceNum,
                        eachPrice: eaPriceNum || (casePriceNum / caseQtyNum) || 0,
                    };
                    newMasterList.push(newProduct);
                    product = newProduct;
                }

                const inventoryItem: InventoryLineItem = {
                    ...product,
                    count: Number(count) || 0,
                    countUnit: countAs?.toString().toLowerCase() === 'each' ? CountUnit.Each : CountUnit.Case
                };
                currentArea.items.push(inventoryItem);
            }
        }

        const newInventoryAreas = Array.from(newInventoryAreasMap.values());

        if (newInventoryAreas.length === 0 || newInventoryAreas.every(area => area.items.length === 0)) {
            alert("Import successful, but no valid inventory items were found in the file. Please check the file's content and structure.");
            return;
        }
        
        setMasterProductList(newMasterList);
        handleStateUpdateForDate(() => newInventoryAreas);
        setActiveAreaId(newInventoryAreas[0]?.id || '');
        alert('Inventory successfully imported!');

      } catch (error) {
        console.error("Error processing Excel file:", error);
        alert("There was an error processing the Excel file. Please ensure it is in the correct format.");
      }
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert("Failed to read the file.");
    };
    reader.readAsBinaryString(file);
    
    event.target.value = '';
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
        <header className="bg-primary shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-white text-center sm:text-left">UC Merced Inventory Tracker</h1>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end items-center gap-4">
                {currentView === 'inventory' && (
                  <>
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full appearance-none px-3 py-2.5 pr-10 text-base text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                            aria-label="Select Inventory Date"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <select 
                      value={activeBuildingId}
                      onChange={(e) => setActiveBuildingId(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2.5 text-base text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                      aria-label="Select Building"
                    >
                      {BUILDINGS.map(building => (
                        <option key={building.id} value={building.id}>{building.name}</option>
                      ))}
                    </select>
                  </>
                )}
                <button
                    onClick={() => setCurrentView(currentView === 'inventory' ? 'manageProducts' : 'inventory')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary font-semibold rounded-md shadow-sm hover:bg-light transition-colors text-sm"
                    aria-label={currentView === 'inventory' ? 'Manage master product list' : 'Back to inventory'}
                >
                    <BriefcaseIcon className="w-4 h-4" />
                    <span>{currentView === 'inventory' ? 'Manage' : 'Inventory'}</span>
                </button>
                <input
                    type="file"
                    id="file-input"
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleFileImport}
                />
                <button
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary font-semibold rounded-md shadow-sm hover:bg-light transition-colors text-sm"
                    aria-label="Import inventory from an Excel file"
                >
                    <ImportIcon className="w-4 h-4" />
                    <span>Import</span>
                </button>
                <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-text font-semibold rounded-md shadow-sm hover:bg-dark transition-colors text-sm"
                    aria-label="Export inventory for current building to Excel"
                >
                    <ExportIcon className="w-4 h-4" />
                    <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto flex-1 flex flex-col min-h-0">
          {currentView === 'inventory' ? (
             <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0 p-4 sm:p-6 lg:p-8">
              <aside className="md:w-1/3 lg:w-1/4 xl:w-1/5">
                <div className="space-y-8">
                  <AreaSidebar
                    areas={areasForSelectedDate}
                    activeAreaId={activeAreaId}
                    onSelectArea={setActiveAreaId}
                    onAddArea={handleAddArea}
                    onUpdateAreaName={handleUpdateAreaName}
                  />
                  <ThemeSwitcher activeTheme={theme} setTheme={setTheme} />
                </div>
              </aside>
              
              <div className="flex-1 overflow-x-auto">
                <div className="md:min-w-[1200px] xl:min-w-full">
                  {activeArea ? (
                    <>
                      <div className="flex justify-end mb-4">
                          <button 
                            onClick={() => { setProductToEdit(null); setProductModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-text font-semibold rounded-full shadow-md hover:bg-dark transition-colors"
                          >
                            <PlusIcon className="w-5 h-5" />
                            Add Product to Master List
                          </button>
                      </div>
                      <SearchBar
                        masterProductList={masterProductList}
                        currentItems={activeArea.items}
                        onAddItem={handleAddItemToSheet}
                      />
                      <InventorySheet
                        areaData={activeArea}
                        displayDate={selectedDate}
                        onItemUpdate={handleItemUpdate}
                      />
                    </>
                  ) : (
                    <div className="text-center p-12 bg-white rounded-xl shadow-lg">
                      <h2 className="text-2xl font-semibold text-gray-700">No Area Selected</h2>
                      <p className="text-gray-500 mt-2">Please select an area, or add a new one to begin inventory for {selectedDate}.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <ManageProducts 
              masterProductList={masterProductList}
              onEditProduct={(product) => {
                setProductToEdit(product);
                setProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteMasterProduct}
            />
          )}
        </main>
      </div>
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
            setProductModalOpen(false);
            setProductToEdit(null);
        }}
        onAddProduct={handleAddProductToMasterList}
        onUpdateProduct={handleUpdateMasterProduct}
        productToEdit={productToEdit}
      />
      <EmailExportModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        buildingName={BUILDINGS.find(b => b.id === activeBuildingId)?.name || ''}
        selectedDate={selectedDate}
        onGenerateAndDownload={generateAndDownloadExcel}
      />
    </>
  );
};

export default App;