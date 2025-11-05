import React, { useState, useRef, useEffect } from 'react';
import { AreaData } from '../types';
import { EditIcon, PlusIcon, CheckIcon, CloseIcon } from './icons';

interface AreaSidebarProps {
  areas: AreaData[];
  activeAreaId: string;
  onSelectArea: (id: string) => void;
  onAddArea: (name: string) => void;
  onUpdateAreaName: (id: string, newName: string) => void;
}

/**
 * A sidebar component that lists storage areas for the selected date.
 * It allows for selecting, adding, and renaming areas.
 */
const AreaSidebar: React.FC<AreaSidebarProps> = ({ areas, activeAreaId, onSelectArea, onAddArea, onUpdateAreaName }) => {
  // State to manage the UI for adding a new area.
  const [isAdding, setIsAdding] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  
  // State to manage the UI for editing an existing area's name.
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to automatically focus the input field when adding or editing an area.
  useEffect(() => {
    if ((isAdding || editingAreaId) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding, editingAreaId]);

  /**
   * Handles the submission of a new area.
   */
  const handleAddArea = () => {
    if (newAreaName.trim()) {
      onAddArea(newAreaName.trim());
      setNewAreaName('');
      setIsAdding(false);
    }
  };

  /**
   * Handles saving the updated name of an area.
   */
  const handleUpdateName = () => {
    if (editingAreaId && editingName.trim()) {
      onUpdateAreaName(editingAreaId, editingName.trim());
    }
    setEditingAreaId(null);
    setEditingName('');
  };

  /**
   * Sets the component into editing mode for a specific area.
   * @param area The area to be edited.
   */
  const startEditing = (area: AreaData) => {
    setEditingAreaId(area.id);
    setEditingName(area.name);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Storage Areas</h2>
      <nav className="flex flex-col gap-2">
        {areas.map(area => (
          <div key={area.id} className="group relative">
            {editingAreaId === area.id ? (
              // Render input form when in editing mode for this area
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleUpdateName}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                  className="w-full px-3 py-2 border border-secondary rounded-lg text-sm focus:ring-2 focus:ring-secondary"
                />
                <button onClick={handleUpdateName} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><CheckIcon className="w-5 h-5"/></button>
                <button onClick={() => setEditingAreaId(null)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><CloseIcon className="w-5 h-5"/></button>
              </div>
            ) : (
              // Render standard area button
              <button
                onClick={() => onSelectArea(area.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex justify-between items-center ${
                  activeAreaId === area.id
                    ? 'bg-secondary text-secondary-text shadow'
                    // Apply hover styles for non-active items
                    : 'bg-white text-gray-700 hover:bg-light hover:text-dark'
                }`}
              >
                {area.name}
                <button 
                  onClick={(e) => { e.stopPropagation(); startEditing(area); }}
                  // Edit icon is subtle, appears on group hover
                  className="opacity-40 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/30"
                  aria-label={`Edit name for ${area.name}`}
                >
                  <EditIcon className={`w-4 h-4 ${activeAreaId === area.id ? 'text-secondary-text' : 'text-gray-500'}`} />
                </button>
              </button>
            )}
          </div>
        ))}
        {isAdding && (
          // Render input form for adding a new area
          <div className="flex items-center gap-2 mt-2">
            <input
              ref={inputRef}
              type="text"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              onBlur={() => { if (!newAreaName.trim()) setIsAdding(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddArea()}
              placeholder="New area name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-secondary"
            />
            <button onClick={handleAddArea} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><CheckIcon className="w-5 h-5"/></button>
            <button onClick={() => setIsAdding(false)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><CloseIcon className="w-5 h-5"/></button>
          </div>
        )}
      </nav>
      <div className="mt-4 border-t pt-4">
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Area
        </button>
      </div>
    </div>
  );
};

export default AreaSidebar;
