'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Store, 
  Supplier, 
  Product, 
  InventoryRecord, 
  PurchaseOrder, 
  PurchaseOrderItem 
} from '@/types';
import {
  mockStores,
  mockSuppliers,
  mockProducts,
  mockInventoryRecords,
  mockPurchaseOrders,
  mockPurchaseOrderItems
} from '@/data/mockData';

const STORAGE_KEY = 'restaurant-mgmt-data-v1';

interface DataContextType {
  stores: Store[];
  suppliers: Supplier[];
  products: Product[];
  inventoryRecords: InventoryRecord[];
  purchaseOrders: PurchaseOrder[];
  purchaseOrderItems: PurchaseOrderItem[];
  
  addStore: (store: Omit<Store, 'id' | 'created_at'>) => void;
  updateStore: (id: string, data: Partial<Store>) => void;
  deleteStore: (id: string) => { success: boolean; message?: string };
  
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => { success: boolean; message?: string };
  
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => { success: boolean; message?: string };
  
  addInventoryRecord: (record: Omit<InventoryRecord, 'id' | 'created_at'>) => void;
  updateInventoryRecord: (id: string, data: Partial<InventoryRecord>) => void;
  deleteInventoryRecord: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(mockInventoryRecords);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState<PurchaseOrderItem[]>(mockPurchaseOrderItems);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.stores) setStores(data.stores);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.products) setProducts(data.products);
        if (data.inventoryRecords) setInventoryRecords(data.inventoryRecords);
        if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);
        if (data.purchaseOrderItems) setPurchaseOrderItems(data.purchaseOrderItems);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        stores,
        suppliers,
        products,
        inventoryRecords,
        purchaseOrders,
        purchaseOrderItems
      }));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }, [stores, suppliers, products, inventoryRecords, purchaseOrders, purchaseOrderItems]);

  useEffect(() => {
    saveToStorage();
  }, [stores, suppliers, products, inventoryRecords, saveToStorage]);

  // Generate simple IDs
  const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Store CRUD
  const addStore = useCallback((store: Omit<Store, 'id' | 'created_at'>) => {
    const newStore: Store = {
      ...store,
      id: generateId('store'),
      created_at: new Date().toISOString().split('T')[0]
    };
    setStores(prev => [...prev, newStore]);
  }, []);

  const updateStore = useCallback((id: string, data: Partial<Store>) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);

  const deleteStore = useCallback((id: string) => {
    // Check if store is referenced by inventory records or purchase orders
    const hasInventory = inventoryRecords.some(r => r.store_id === id);
    const hasOrders = purchaseOrders.some(o => o.store_id === id);
    
    if (hasInventory || hasOrders) {
      return { 
        success: false, 
        message: `无法删除该门店：存在${hasInventory ? '库存记录' : ''}${hasInventory && hasOrders ? '和' : ''}${hasOrders ? '采购单' : ''}。` 
      };
    }
    
    setStores(prev => prev.filter(s => s.id !== id));
    return { success: true };
  }, [inventoryRecords, purchaseOrders]);

  // Supplier CRUD
  const addSupplier = useCallback((supplier: Omit<Supplier, 'id' | 'created_at'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: generateId('supplier'),
      created_at: new Date().toISOString().split('T')[0]
    };
    setSuppliers(prev => [...prev, newSupplier]);
  }, []);

  const updateSupplier = useCallback((id: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    // Check if supplier is referenced by products
    const hasProducts = products.some(p => p.supplier_id === id);
    
    if (hasProducts) {
      return { 
        success: false, 
        message: '无法删除该供应商：存在关联的产品。请先更新或删除相关产品。' 
      };
    }
    
    setSuppliers(prev => prev.filter(s => s.id !== id));
    return { success: true };
  }, [products]);

  // Product CRUD
  const addProduct = useCallback((product: Omit<Product, 'id' | 'created_at'>) => {
    const newProduct: Product = {
      ...product,
      id: generateId('product'),
      created_at: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    return { success: true };
  }, []);

  // Inventory Record CRUD
  const addInventoryRecord = useCallback((record: Omit<InventoryRecord, 'id' | 'created_at'>) => {
    const newRecord: InventoryRecord = {
      ...record,
      id: generateId('inv'),
      created_at: new Date().toISOString().split('T')[0]
    };
    setInventoryRecords(prev => [...prev, newRecord]);
  }, []);

  const updateInventoryRecord = useCallback((id: string, data: Partial<InventoryRecord>) => {
    setInventoryRecords(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }, []);

  const deleteInventoryRecord = useCallback((id: string) => {
    setInventoryRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <DataContext.Provider
      value={{
        stores,
        suppliers,
        products,
        inventoryRecords,
        purchaseOrders,
        purchaseOrderItems,
        addStore,
        updateStore,
        deleteStore,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addProduct,
        updateProduct,
        deleteProduct,
        addInventoryRecord,
        updateInventoryRecord,
        deleteInventoryRecord,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
