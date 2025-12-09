import { create } from 'zustand';
import type {
  DataType,
  DataTypeCategory,
  Property,
  DataSource,
  CategoryWithTypes,
  CatalogueStats,
} from '../types/catalogue';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5174';

// ============================================
// Vocabulary-First API
// ============================================

const catalogueApi = {
  // Data Types (vocabulary)
  async listDataTypes(): Promise<DataType[]> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch data types');
    return response.json();
  },

  async getDataType(id: string): Promise<DataType> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types/${id}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch data type');
    return response.json();
  },

  async createDataType(dataType: Partial<DataType>): Promise<DataType> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dataType),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create data type');
    }
    return response.json();
  },

  async updateDataType(id: string, updates: Partial<DataType>): Promise<DataType> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update data type');
    return response.json();
  },

  async deleteDataType(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete data type');
  },

  // Properties (attributes of a data type)
  async addProperty(dataTypeId: string, property: Partial<Property>): Promise<DataType> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types/${dataTypeId}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(property),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add property');
    }
    return response.json();
  },

  async updateProperty(dataTypeId: string, propertyId: string, updates: Partial<Property>): Promise<DataType> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types/${dataTypeId}/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update property');
    return response.json();
  },

  async deleteProperty(dataTypeId: string, propertyId: string): Promise<DataType> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types/${dataTypeId}/properties/${propertyId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete property');
    return response.json();
  },

  // Data Sources (link data type to entity)
  async addSource(dataTypeId: string, source: Partial<DataSource>): Promise<DataType> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types/${dataTypeId}/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(source),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add source');
    }
    return response.json();
  },

  async updateSource(dataTypeId: string, entityId: string, updates: Partial<DataSource>): Promise<DataType> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types/${dataTypeId}/sources/${entityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update source');
    return response.json();
  },

  async removeSource(dataTypeId: string, entityId: string): Promise<DataType> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/data-types/${dataTypeId}/sources/${entityId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to remove source');
    return response.json();
  },

  // Categories
  async listCategories(): Promise<DataTypeCategory[]> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/categories`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async createCategory(category: Partial<DataTypeCategory>): Promise<DataTypeCategory> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(category),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create category');
    }
    return response.json();
  },

  // Search
  async search(query: string): Promise<{ dataTypes: DataType[] }> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/search?q=${encodeURIComponent(query)}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to search');
    return response.json();
  },

  // Export
  async exportAll(): Promise<{ categories: DataTypeCategory[]; dataTypes: DataType[] }> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/export`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to export');
    return response.json();
  },

  // Stats
  async getStats(): Promise<CatalogueStats> {
    const response = await fetch(`${API_BASE}/api/catalogue/v2/stats`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
};

// ============================================
// Store Interface
// ============================================

interface DataCatalogueState {
  // Data
  dataTypes: DataType[];
  categories: DataTypeCategory[];
  selectedDataType: DataType | null;

  // Loading states
  isLoading: boolean;
  isDataTypeLoading: boolean;
  error: string | null;

  // Search
  searchQuery: string;
  searchResults: DataType[] | null;

  // Actions
  fetchDataTypes: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  selectDataType: (id: string) => Promise<void>;
  clearSelection: () => void;

  // Data Type CRUD
  createDataType: (dataType: Partial<DataType>) => Promise<DataType>;
  updateDataType: (id: string, updates: Partial<DataType>) => Promise<void>;
  deleteDataType: (id: string) => Promise<void>;

  // Property CRUD
  addProperty: (dataTypeId: string, property: Partial<Property>) => Promise<void>;
  updateProperty: (dataTypeId: string, propertyId: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (dataTypeId: string, propertyId: string) => Promise<void>;

  // Source CRUD
  addSource: (dataTypeId: string, source: Partial<DataSource>) => Promise<void>;
  updateSource: (dataTypeId: string, entityId: string, updates: Partial<DataSource>) => Promise<void>;
  removeSource: (dataTypeId: string, entityId: string) => Promise<void>;

  // Category CRUD
  createCategory: (category: Partial<DataTypeCategory>) => Promise<DataTypeCategory>;

  // Search & Export
  setSearchQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  exportAll: () => Promise<{ categories: DataTypeCategory[]; dataTypes: DataType[] }>;

  // Helper: Get data types grouped by category
  getDataTypesByCategory: () => CategoryWithTypes[];
}

// ============================================
// Store Implementation
// ============================================

export const useDataCatalogueStore = create<DataCatalogueState>((set, get) => ({
  // Initial state
  dataTypes: [],
  categories: [],
  selectedDataType: null,
  isLoading: false,
  isDataTypeLoading: false,
  error: null,
  searchQuery: '',
  searchResults: null,

  // Fetch all data types
  fetchDataTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const dataTypes = await catalogueApi.listDataTypes();
      set({ dataTypes, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch data types',
        isLoading: false,
      });
    }
  },

  // Fetch categories
  fetchCategories: async () => {
    try {
      const categories = await catalogueApi.listCategories();
      set({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },

  // Select a data type
  selectDataType: async (id: string) => {
    set({ isDataTypeLoading: true, error: null });
    try {
      const dataType = await catalogueApi.getDataType(id);
      set({
        selectedDataType: dataType,
        isDataTypeLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch data type',
        isDataTypeLoading: false,
      });
    }
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedDataType: null });
  },

  // Create data type
  createDataType: async (dataType) => {
    const result = await catalogueApi.createDataType(dataType);
    await get().fetchDataTypes();
    return result;
  },

  // Update data type
  updateDataType: async (id, updates) => {
    await catalogueApi.updateDataType(id, updates);
    await get().fetchDataTypes();
    if (get().selectedDataType?.id === id) {
      await get().selectDataType(id);
    }
  },

  // Delete data type
  deleteDataType: async (id) => {
    await catalogueApi.deleteDataType(id);
    if (get().selectedDataType?.id === id) {
      set({ selectedDataType: null });
    }
    await get().fetchDataTypes();
  },

  // Add property
  addProperty: async (dataTypeId, property) => {
    const updated = await catalogueApi.addProperty(dataTypeId, property);
    set({ selectedDataType: updated });
    await get().fetchDataTypes();
  },

  // Update property
  updateProperty: async (dataTypeId, propertyId, updates) => {
    const updated = await catalogueApi.updateProperty(dataTypeId, propertyId, updates);
    set({ selectedDataType: updated });
    await get().fetchDataTypes();
  },

  // Delete property
  deleteProperty: async (dataTypeId, propertyId) => {
    const updated = await catalogueApi.deleteProperty(dataTypeId, propertyId);
    set({ selectedDataType: updated });
    await get().fetchDataTypes();
  },

  // Add source
  addSource: async (dataTypeId, source) => {
    const updated = await catalogueApi.addSource(dataTypeId, source);
    set({ selectedDataType: updated });
    await get().fetchDataTypes();
  },

  // Update source
  updateSource: async (dataTypeId, entityId, updates) => {
    const updated = await catalogueApi.updateSource(dataTypeId, entityId, updates);
    set({ selectedDataType: updated });
    await get().fetchDataTypes();
  },

  // Remove source
  removeSource: async (dataTypeId, entityId) => {
    const updated = await catalogueApi.removeSource(dataTypeId, entityId);
    set({ selectedDataType: updated });
    await get().fetchDataTypes();
  },

  // Create category
  createCategory: async (category) => {
    const result = await catalogueApi.createCategory(category);
    await get().fetchCategories();
    return result;
  },

  // Search
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  search: async (query) => {
    if (query.length < 2) {
      set({ searchResults: null });
      return;
    }
    try {
      const results = await catalogueApi.search(query);
      set({ searchResults: results.dataTypes });
    } catch (error) {
      console.error('Search error:', error);
    }
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: null });
  },

  // Export
  exportAll: async () => {
    return catalogueApi.exportAll();
  },

  // Helper: Get data types grouped by category
  getDataTypesByCategory: () => {
    const { dataTypes, categories } = get();
    const result: CategoryWithTypes[] = [];

    // Group data types by category
    const grouped = new Map<string, DataType[]>();
    for (const dt of dataTypes) {
      const catId = dt.category || 'other';
      if (!grouped.has(catId)) {
        grouped.set(catId, []);
      }
      grouped.get(catId)!.push(dt);
    }

    // Sort categories and create result
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
    for (const cat of sortedCategories) {
      const types = grouped.get(cat.id) || [];
      if (types.length > 0) {
        result.push({ category: cat, dataTypes: types });
      }
    }

    // Add "Other" category for uncategorized types
    const otherTypes = grouped.get('other') || [];
    if (otherTypes.length > 0) {
      result.push({
        category: { id: 'other', name: 'Other', order: 999 },
        dataTypes: otherTypes,
      });
    }

    return result;
  },
}));
