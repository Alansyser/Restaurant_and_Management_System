'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { isAdmin } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table, { TableRow, TableCell } from '@/components/Table';
import Modal from '@/components/Modal';
import { Plus, Filter, ClipboardList, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { InventoryRecord, RecordType } from '@/types';
import { cn } from '@/lib/utils';

export default function InventoryPage() {
  const { stores, products, inventoryRecords, addInventoryRecord, updateInventoryRecord, deleteInventoryRecord } = useData();
  const { user } = useAuth();
  
  // For store users, only allow their own store
  const initialStoreId = isAdmin(user) 
    ? stores[0]?.id || '' 
    : user?.store_id || '';
    
  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId);

  // If store user and store changes somehow, reset
  useEffect(() => {
    if (!isAdmin(user) && user?.store_id) {
      setSelectedStoreId(user.store_id);
    }
  }, [user]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustMode, setIsAdjustMode] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InventoryRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<InventoryRecord | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    store_id: '',
    product_id: '',
    quantity: 0,
    unit: '',
    record_type: 'initial_stock' as RecordType,
    note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedStore = stores.find(s => s.id === selectedStoreId);
  
  // Calculate current inventory for selected store
  const inventoryData = products.map(product => {
    const records = inventoryRecords.filter(
      r => r.store_id === selectedStoreId && r.product_id === product.id
    );
    const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
    const lastRecord = records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    return {
      ...product,
      current_quantity: totalQuantity,
      last_updated: lastRecord?.created_at || 'Never',
    };
  });

  // Get recent records for selected store
  const recentRecords = inventoryRecords
    .filter(r => r.store_id === selectedStoreId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const resetForm = (storeId: string = selectedStoreId) => {
    setFormData({
      store_id: storeId,
      product_id: '',
      quantity: 0,
      unit: '',
      record_type: 'initial_stock',
      note: '',
    });
    setEditingRecord(null);
    setIsAdjustMode(false);
    setErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (record: InventoryRecord) => {
    setEditingRecord(record);
    setFormData({
      store_id: record.store_id,
      product_id: record.product_id,
      quantity: record.quantity,
      unit: record.unit,
      record_type: record.record_type,
      note: record.note || '',
    });
    setIsAdjustMode(false);
    setIsModalOpen(true);
  };

  const openAdjustModal = (productId: string, defaultUnit: string) => {
    resetForm();
    setFormData({
      ...formData,
      product_id: productId,
      unit: defaultUnit,
      record_type: 'adjustment',
    });
    setIsAdjustMode(true);
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.product_id) newErrors.product_id = '请选择产品';
    if (!formData.unit) newErrors.unit = '请输入单位';
    if (isNaN(formData.quantity)) newErrors.quantity = '请输入有效数字';
    if (!formData.record_type) newErrors.record_type = '请选择记录类型';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingRecord) {
      updateInventoryRecord(editingRecord.id, formData);
    } else {
      addInventoryRecord(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (record: InventoryRecord) => {
    setDeleteConfirm(record);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteInventoryRecord(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      product_id: productId,
      unit: product?.default_unit || '',
    });
  };

  const getRecordTypeLabel = (type: RecordType) => {
    switch(type) {
      case 'initial_stock': return '初始库存';
      case 'purchase_received': return '采购入库';
      case 'adjustment': return '库存调整';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory Tracking" 
        description="Monitor current stock levels and record inventory adjustments."
        action={
          <Button size="lg" onClick={openAddModal} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Record
          </Button>
        }
      />

      {/* Store Selector - only for admin */}
      {isAdmin(user) && (
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Store</label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                >
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name} - {store.location}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Current Store Info */}
      <Card className="mb-8">
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex items-center">
            <ClipboardList className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Viewing inventory for: {selectedStore?.name}</span>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card title="Current Stock Levels">
        <Table headers={['Product', 'Category', 'Current Stock', 'Unit', 'Last Updated', 'Actions']}>
          {inventoryData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold text-slate-900">{item.name}</TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                  {item.category}
                </span>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "font-bold text-lg",
                  item.current_quantity <= 5 ? "text-red-600" : "text-slate-900"
                )}>
                  {item.current_quantity}
                </span>
              </TableCell>
              <TableCell>{item.default_unit}</TableCell>
              <TableCell className="text-slate-500">{item.last_updated}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openAdjustModal(item.id, item.default_unit)}
                >
                  Adjust
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      {/* Recent Records */}
      <Card title="Recent Inventory Records">
        {recentRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <ClipboardList className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No inventory records yet. Add your first record to get started!</p>
          </div>
        ) : (
          <Table headers={['Date', 'Product', 'Quantity', 'Type', 'Note', 'Actions']}>
            {recentRecords.map((record) => {
              const product = products.find(p => p.id === record.product_id);
              return (
                <TableRow key={record.id}>
                  <TableCell>{record.created_at}</TableCell>
                  <TableCell className="font-medium">{product?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-semibold",
                      record.quantity > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {record.quantity > 0 ? '+' : ''}{record.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {getRecordTypeLabel(record.record_type)}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 truncate max-w-[150px]">
                    {record.note || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-500 hover:text-blue-600"
                        onClick={() => openEditModal(record)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-500 hover:text-red-600"
                        onClick={() => handleDelete(record)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        )}
      </Card>

      {/* Add/Edit/Adjust Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isAdjustMode ? 'Adjust Inventory' : (editingRecord ? 'Edit Inventory Record' : 'Add Inventory Record')}
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingRecord ? 'Update' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Store
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.store_id}
              onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-4 py-2 rounded-lg border ${errors.product_id ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={formData.product_id}
              onChange={(e) => handleProductChange(e.target.value)}
            >
              <option value="">Select product...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            {errors.product_id && <p className="text-red-500 text-sm mt-1">{errors.product_id}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                className={`w-full px-4 py-2 rounded-lg border ${errors.quantity ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                placeholder={isAdjustMode ? "Use negative for deduction" : ""}
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-2 rounded-lg border ${errors.unit ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
              {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Record Type <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-4 py-2 rounded-lg border ${errors.record_type ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={formData.record_type}
              onChange={(e) => setFormData({ ...formData, record_type: e.target.value as RecordType })}
            >
              <option value="initial_stock">Initial Stock</option>
              <option value="purchase_received">Purchase Received</option>
              <option value="adjustment">Adjustment</option>
            </select>
            {errors.record_type && <p className="text-red-500 text-sm mt-1">{errors.record_type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Note
            </label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Add a note about this inventory change..."
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Inventory Record"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-slate-700">
              确定要删除这条库存记录吗？
            </p>
            <p className="text-slate-500 text-sm mt-1">
              删除后库存总量将重新计算，此操作无法撤销。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
