'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Table, { TableRow, TableCell } from '@/components/Table';
import Modal from '@/components/Modal';
import { Plus, Edit2, Trash2, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { Store } from '@/types';

export default function StoresPage() {
  const { stores, inventoryRecords, purchaseOrders, addStore, updateStore, deleteStore } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ store: Store; canDelete: boolean; message?: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({ name: '', location: '' });
    setEditingStore(null);
    setErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      location: store.location,
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入门店名称';
    if (!formData.location.trim()) newErrors.location = '请输入地址';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingStore) {
      updateStore(editingStore.id, formData);
    } else {
      addStore(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (store: Store) => {
    const result = deleteStore(store.id);
    setDeleteConfirm({
      store,
      canDelete: result.success,
      message: result.message
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm && deleteConfirm.canDelete) {
      deleteStore(deleteConfirm.store.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Stores" 
        description="Manage your restaurant branch locations."
        action={
          <Button size="lg" onClick={openAddModal} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Store
          </Button>
        }
      />

      <Table headers={['Store Name', 'Location', 'Created At', 'Actions']}>
        {stores.map((store) => (
          <TableRow key={store.id}>
            <TableCell className="font-semibold text-slate-900">{store.name}</TableCell>
            <TableCell>
              <div className="flex items-center text-slate-600">
                <MapPin className="w-4 h-4 mr-2" />
                {store.location}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center text-slate-500">
                <Calendar className="w-4 h-4 mr-2" />
                {store.created_at}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500 hover:text-blue-600"
                  onClick={() => openEditModal(store)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500 hover:text-red-600"
                  onClick={() => handleDelete(store)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </Table>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStore ? 'Edit Store' : 'Add Store'}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingStore ? 'Update' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 rounded-lg border ${errors.location ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={deleteConfirm?.canDelete ? 'Delete Store' : 'Cannot Delete Store'}
        size="sm"
        footer={
          deleteConfirm?.canDelete ? (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          ) : (
            <Button onClick={() => setDeleteConfirm(null)}>
              OK
            </Button>
          )
        }
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${deleteConfirm?.canDelete ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`w-6 h-6 ${deleteConfirm?.canDelete ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
          <div>
            {deleteConfirm?.canDelete ? (
              <>
                <p className="text-slate-700">
                  确定要删除门店 "<strong>{deleteConfirm.store.name}</strong>" 吗？
                </p>
                <p className="text-slate-500 text-sm mt-1">此操作无法撤销。</p>
              </>
            ) : (
              <>
                <p className="text-slate-700 font-medium">
                  {deleteConfirm?.message}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  请先删除或迁移相关的库存记录和采购订单。
                </p>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
