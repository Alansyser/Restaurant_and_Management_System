'use client';

import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import Table, { TableRow, TableCell } from '@/components/Table';
import Button from '@/components/Button';
import { Package, ShoppingCart, AlertTriangle, Plus } from 'lucide-react';

export default function StoreDashboard() {
  const {
    products,
    inventoryRecords,
    purchaseOrders,
    stores
  } = useData();
  const { user } = useAuth();

  // Get the current store
  const currentStore = stores.find(s => s.id === user?.store_id);

  // Filter data for this store only
  const storeInventoryRecords = inventoryRecords.filter(r => r.store_id === user?.store_id);
  const storePurchaseOrders = purchaseOrders.filter(o => o.store_id === user?.store_id);

  // Calculate current inventory for this store
  const calculateStoreInventory = () => {
    const inventory: Record<string, number> = {};
    storeInventoryRecords.forEach(record => {
      if (!inventory[record.product_id]) {
        inventory[record.product_id] = 0;
      }
      inventory[record.product_id] += record.quantity;
    });
    return inventory;
  };

  const currentInventory = calculateStoreInventory();
  const lowStockItems = products.filter(p => (currentInventory[p.id] || 0) < 5);
  const pendingOrders = storePurchaseOrders.filter(o => o.status === 'pending');

  const stats = [
    {
      name: 'Current Products',
      value: Object.keys(currentInventory).length,
      icon: Package,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      name: 'Pending Orders',
      value: pendingOrders.length,
      icon: ShoppingCart,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      name: 'Low Stock Items',
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ];

  // Get recent activity for this store
  const recentRecords = [...storeInventoryRecords]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const recentOrders = [...storePurchaseOrders]
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Dashboard"
        description={`Manage ${currentStore?.name || 'your store'}`}
        action={
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Purchase Order
            </Button>
          </div>
        }
      />

      {/* Store Info Card */}
      {currentStore && (
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Package className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{currentStore.name}</h2>
              <p className="text-slate-600">{currentStore.location}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card title="Low Stock Alert">
            <Table headers={['Product', 'Current Stock', 'Category']}>
              {lowStockItems.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-red-700">{product.name}</TableCell>
                  <TableCell className="text-red-700 font-bold">
                    {currentInventory[product.id] || 0} {product.default_unit}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {product.category}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </Card>
        )}

        {/* Recent Purchase Orders */}
        <Card title="Recent Purchase Orders">
          {recentOrders.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No recent purchase orders</p>
          ) : (
            <Table headers={['Order ID', 'Date', 'Status']}>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-blue-600">#{order.id}</TableCell>
                  <TableCell>{order.order_date}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>

        {/* Recent Inventory Activity */}
        <Card title="Recent Inventory Activity">
          {recentRecords.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No recent inventory activity</p>
          ) : (
            <Table headers={['Product', 'Quantity', 'Date', 'Type']}>
              {recentRecords.map((record) => {
                const product = products.find(p => p.id === record.product_id);
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{product?.name || 'Unknown'}</TableCell>
                    <TableCell className={record.quantity > 0 ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
                      {record.quantity > 0 ? '+' : ''}{record.quantity} {record.unit}
                    </TableCell>
                    <TableCell>{record.created_at}</TableCell>
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