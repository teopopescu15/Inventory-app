import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Order } from '../types/order';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { FileText, Eye, Trash2, Download } from 'lucide-react';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'FINALIZED'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.success;

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = filter === 'ALL' ? undefined : filter;
      const data = await apiService.orders.getAll(statusParam);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      await apiService.orders.delete(id);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete order');
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      const blob = await apiService.orders.downloadInvoice(order.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to download invoice');
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const finalizedCount = orders.filter((o) => o.status === 'FINALIZED').length;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-gray-400">Manage and track your orders</p>
        </div>

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg p-4 mb-6">
            {successMessage}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800 p-4">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="text-2xl font-bold mt-1">{orders.length}</p>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold mt-1 text-yellow-400">{pendingCount}</p>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4">
            <p className="text-gray-400 text-sm">Finalized</p>
            <p className="text-2xl font-bold mt-1 text-green-400">{finalizedCount}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'PENDING', 'FINALIZED'].map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status as any)}
              variant={filter === status ? 'default' : 'outline'}
              className={filter === status ? 'bg-blue-600' : 'border-gray-700 text-white hover:bg-gray-800'}
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading orders...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-4">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800 p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">No orders found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first order from the inventory</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-gray-900 border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {order.invoiceNumber || `Order #${order.id}`}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'PENDING'
                            ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                            : 'bg-green-500/20 border border-green-500/50 text-green-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Client</p>
                        <p className="text-white font-medium">{order.clientName}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Items</p>
                        <p className="text-white font-medium">{order.totalItems}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Amount</p>
                        <p className="text-white font-medium">${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Created</p>
                        <p className="text-white font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      variant="outline"
                      size="sm"
                      className="border-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {order.status === 'FINALIZED' && (
                      <Button
                        onClick={() => handleDownloadInvoice(order)}
                        variant="outline"
                        size="sm"
                        className="border-gray-700"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {order.status === 'PENDING' && (
                      <Button
                        onClick={() => handleDelete(order.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-700 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
