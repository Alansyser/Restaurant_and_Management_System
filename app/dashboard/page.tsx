'use client';

import { useData } from '@/context/DataContext';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import Table, { TableRow, TableCell } from '@/components/Table';
import { Package, Truck, ShoppingCart, ClipboardList, Users } from 'lucide-react';

export default function AdminDashboard() {
  const { 
    products, 
    suppliers, 
    purchaseOrders, 
    inventoryRecords, 
    stores 
  } = useData();

  const stats = [
    { 
      name: 'Total Stores', 
      value: stores.length, 
      icon: Users, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      name: 'Total Products', 
      value: products.length, 
      icon: Package, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      name: 'Total Suppliers', 
      value: suppliers.length, 
      icon: Truck, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      name: 'Active Orders', 
      value: purchaseOrders.filter(o => o.status === 'pending').length, 
      icon: ShoppingCart, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    }
  ];

  const sortedOrders = [...purchaseOrders].sort(
    (a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
  );

  const sortedRecords = [...inventoryRecords].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your restaurant operations across all branches." 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Purchase Orders */}
        <Card title="Recent Purchase Orders">
          {sortedOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No purchase orders yet.</p>
            </div>
          ) : (
            <Table headers={['Order ID', 'Store', 'Supplier', 'Status', 'Date']}>
              {sortedOrders.slice(0, 5).map((order) => {
                const supplier = suppliers.find(s => s.id === order.supplier_id);
                const store = stores.find(s => s.id === order.store_id);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-blue-600">#{order.id}</TableCell>
                    <TableCell>{store?.name || 'Unknown'}</TableCell>
                    <TableCell>{supplier?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{order.order_date}</TableCell>
                  </TableRow>
                );
              })}
            </Table>
          )}
        </Card>

        {/* Recent Inventory Records */}
        <Card title="Recent Inventory Activity">
          {sortedRecords.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No inventory records yet.</p>
            </div>
          ) : (
            <Table headers={['Store', 'Product', 'Quantity', 'Type']}>
              {sortedRecords.slice(0, 5).map((record) => {
                const store = stores.find(s => s.id === record.store_id);
                const product = products.find(p => p.id === record.product_id);
                return (
                  <TableRow key={record.id}>
                    <TableCell>{store?.name || 'Unknown'}</TableCell>
                    <TableCell>{product?.name || 'Unknown'}</TableCell>
                    <TableCell>{record.quantity} {record.unit}</TableCell>
                    <TableCell>
                      <span className="text-slate-500 text-xs italic">
                        {record.record_type.replace('_', ' ')}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}