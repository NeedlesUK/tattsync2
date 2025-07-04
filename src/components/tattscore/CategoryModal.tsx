import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Settings } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  max_entries: number;
  current_entries: number;
}

interface CategoryModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (categories: Category[]) => Promise<void>;
  initialCategories?: Category[];
}

export function CategoryModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave,
  initialCategories = []
}: CategoryModalProps) {
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.length > 0 
      ? initialCategories 
      : [
          {
            id: '1',
            name: 'Small Color',
            description: 'Color tattoos under 5 inches',
            max_entries: 20,
            current_entries: 0
          },
          {
            id: '2',
            name: 'Medium Color',
            description: 'Color tattoos 5-10 inches',
            max_entries: 20,
            current_entries: 0
          },
          {
            id: '3',
            name: 'Large Color',
            description: 'Color tattoos over 10 inches',
            max_entries: 15,
            current_entries: 0
          }
        ]
  );

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const addCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: '',
      description: '',
      max_entries: 20,
      current_entries: 0
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map(category => 
      category.id === id ? { ...category, ...updates } : category
    ));
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(categories);
      onClose();
    } catch (error) {
      console.error('Error saving categories:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Competition Categories</h2>
            <p className="text-gray-300 text-sm">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-2">Competition Categories</h3>
              <p className="text-blue-200 text-sm">
                Define the categories for your competition. Categories are used to group entries by style and size.
                Each category can have a maximum number of entries.
              </p>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-medium">Category</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeCategory(category.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category Name</label>
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Small Color, Traditional, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={category.description}
                      onChange={(e) => updateCategory(category.id, { description: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Describe what qualifies for this category"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Maximum Entries</label>
                  <input
                    type="number"
                    value={category.max_entries}
                    onChange={(e) => updateCategory(category.id, { max_entries: parseInt(e.target.value) || 0 })}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Maximum number of entries allowed in this category</p>
                </div>

                {category.current_entries > 0 && (
                  <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      This category already has {category.current_entries} entries. Changes may affect existing entries.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Category Button */}
          <button
            onClick={addCategory}
            className="w-full mt-6 border-2 border-dashed border-white/20 rounded-lg p-6 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </button>

          <div className="mt-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-300 font-medium mb-2">Category Examples</h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• <strong>Size-based:</strong> Small Color, Medium Black & Grey, Large Color</li>
              <li>• <strong>Style-based:</strong> Traditional, Neo-Traditional, Japanese, Realism</li>
              <li>• <strong>Combined:</strong> Small Traditional, Large Japanese, Medium Realism</li>
              <li>• <strong>Special:</strong> Best of Day, Best of Show, Best Portrait</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 p-6 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || categories.some(c => !c.name.trim())}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Categories'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}