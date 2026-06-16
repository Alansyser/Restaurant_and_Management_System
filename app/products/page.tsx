'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Table, { TableRow, TableCell } from '@/components/Table';
import Modal from '@/components/Modal';
import { Plus, Edit2, Trash2, Search, AlertTriangle } from 'lucide-react';
import { Product } from '@/types';

export default function ProductsPage() {
  const { products, suppliers, addProduct, updateProduct, deleteProduct } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    default_unit: '',
    supplier_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      default_unit: '',
      supplier_id: suppliers[0]?.id || '',
    });
    setEditingProduct(null);
    setErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      default_unit: product.default_unit,
      supplier_id: product.supplier_id,
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入产品名称';
    if (!formData.category.trim()) newErrors.category = '请输入分类';
    if (!formData.default_unit.trim()) newErrors.default_unit = '请输入单位';
    if (!formData.supplier_id) newErrors.supplier_id = '请选择供应商';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (product: Product) => {
    setDeleteConfirm(product);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteProduct(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Products" 
        description="Manage your inventory items and their default suppliers."
        action={
          <Button size="lg" onClick={openAddModal} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Product
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="Search products or categories..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table headers={['Product Name', 'Category', 'Default Unit', 'Supplier', 'Actions']}>
        {filteredProducts.map((product) => {
          const supplier = suppliers.find(s => s.id === product.supplier_id);
          return (
            <TableRow key={product.id}>
              <TableCell className="font-semibold text-slate-900">{product.name}</TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                  {product.category}
                </span>
              </TableCell>
              <TableCell>{product.default_unit}</TableCell>
              <TableCell>{supplier?.name || 'Unknown'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-500 hover:text-blue-600"
                    onClick={() => openEditModal(product)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-500 hover:text-red-600"
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </Table>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? 'Update' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product Name <span className="text-red-500">*</span>
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
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 rounded-lg border ${errors.category ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Default Unit <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-4 py-2 rounded-lg border ${errors.default_unit ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={formData.default_unit}
              onChange={(e) => setFormData({ ...formData, default_unit: e.target.value })}
            >
              <option value="">Select unit...</option>
              <option value="box">box</option>
              <option value="lb">lb</option>
              <option value="kg">kg</option>
              <option value="pcs">pcs</option>
              <option value="pack">pack</option>
            </select>
            {errors.default_unit && <p className="text-red-500 text-sm mt-1">{errors.default_unit}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-4 py-2 rounded-lg border ${errors.supplier_id ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
            >
              <option value="">Select supplier...</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.supplier_id && <p className="text-red-500 text-sm mt-1">{errors.supplier_id}</p>}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
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
              确定要删除产品 "<strong>{deleteConfirm?.name}</strong>" 吗？
            </p>
            <p className="text-slate-500 text-sm mt-1">此操作无法撤销。</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
