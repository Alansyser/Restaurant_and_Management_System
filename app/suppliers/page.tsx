'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Table, { TableRow, TableCell } from '@/components/Table';
import Modal from '@/components/Modal';
import { Plus, Edit2, Trash2, Phone, FileText, AlertTriangle } from 'lucide-react';
import { Supplier } from '@/types';

export default function SuppliersPage() {
  const { suppliers, products, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ supplier: Supplier; canDelete: boolean; message?: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({ name: '', phone: '', notes: '' });
    setEditingSupplier(null);
    setErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      notes: supplier.notes || '',
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入供应商名称';
    if (!formData.phone.trim()) newErrors.phone = '请输入联系电话';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData);
    } else {
      addSupplier(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (supplier: Supplier) => {
    const hasProducts = products.some(p => p.supplier_id === supplier.id);
    setDeleteConfirm({
      supplier,
      canDelete: !hasProducts,
      message: hasProducts ? '该供应商仍被产品使用，无法删除。' : undefined
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm && deleteConfirm.canDelete) {
      deleteSupplier(deleteConfirm.supplier.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Suppliers" 
        description="Manage the vendors you purchase products from."
        action={
          <Button size="lg" onClick={openAddModal} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Supplier
          </Button>
        }
      />

      <Table headers={['Supplier Name', 'Contact Info', 'Notes', 'Actions']}>
        {suppliers.map((supplier) => (
          <TableRow key={supplier.id}>
            <TableCell className="font-semibold text-slate-900">{supplier.name}</TableCell>
            <TableCell>
              <div className="flex items-center text-slate-600">
                <Phone className="w-4 h-4 mr-2" />
                {supplier.phone}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center text-slate-500 max-w-xs truncate">
                <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                {supplier.notes || 'No notes'}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500 hover:text-blue-600"
                  onClick={() => openEditModal(supplier)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500 hover:text-red-600"
                  onClick={() => handleDelete(supplier)}
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
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSupplier ? 'Update' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supplier Name <span className="text-red-500">*</span>
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
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={deleteConfirm?.canDelete ? 'Delete Supplier' : 'Cannot Delete Supplier'}
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
                  确定要删除供应商 "<strong>{deleteConfirm.supplier.name}</strong>" 吗？
                </p>
                <p className="text-slate-500 text-sm mt-1">此操作无法撤销。</p>
              </>
            ) : (
              <>
                <p className="text-slate-700 font-medium">
                  {deleteConfirm?.message}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  请先更新或删除关联的产品，然后再尝试删除。
                </p>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
