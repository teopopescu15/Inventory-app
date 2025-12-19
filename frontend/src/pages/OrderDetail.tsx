import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Order } from '../types/order';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Download, FileText } from 'lucide-react';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.orders.getById(Number(id));
      setOrder(data);
    } catch (err: any) {
      console.error('Failed to fetch order:', err);
      setError(err.response?.data?.error || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!order) return;

    if (!confirm(
      'This will deduct inventory and generate an invoice. This action cannot be undone. Continue?'
    )) {
      return;
    }

    setFinalizing(true);
    setError(null);

    try {
      await apiService.orders.finalize(order.id);
      await fetchOrder(); // Reload order to get updated status
      // Auto-download invoice
      const blob = await apiService.orders.downloadInvoice(order.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Failed to finalize order:', err);
      setError(err.response?.data?.error || 'Failed to finalize order');
    } finally {
      setFinalizing(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto text-center py-12 text-gray-400">
          Loading order details...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-4">
            {error || 'Order not found'}
          </div>
          <Button onClick={() => navigate('/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {order.invoiceNumber || `Order #${order.id}`}
              </h1>
              <p className="text-gray-400 mt-2">
                Created on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                order.status === 'PENDING'
                  ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                  : 'bg-green-500/20 border border-green-500/50 text-green-400'
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h2 className="text-xl font-semibold mb-4">Client Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Name</p>
                  <p className="text-white font-medium">{order.clientName}</p>
                </div>
                {order.clientCompany && (
                  <div>
                    <p className="text-gray-400">Company</p>
                    <p className="text-white font-medium">{order.clientCompany}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400">Address</p>
                  <p className="text-white font-medium">{order.clientAddress}</p>
                </div>
                <div>
                  <p className="text-gray-400">City</p>
                  <p className="text-white font-medium">
                    {order.clientCity}, {order.clientPostalCode}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Phone</p>
                  <p className="text-white font-medium">{order.clientPhone}</p>
                </div>
                {order.clientEmail && (
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white font-medium">{order.clientEmail}</p>
                  </div>
                )}
              </div>
              {order.notes && (
                <div className="mt-4">
                  <p className="text-gray-400">Notes</p>
                  <p className="text-white font-medium mt-1">{order.notes}</p>
                </div>
              )}
            </Card>

            {/* Order Items */}
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.productTitle}</p>
                      <p className="text-sm text-gray-400">
                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-white font-bold">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Summary */}
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Items</span>
                  <span className="text-white font-semibold">{order.totalItems}</span>
                </div>
                <div className="border-t border-gray-800 pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-white font-bold">Total Amount</span>
                    <span className="text-blue-400 font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                {order.status === 'PENDING' && (
                  <Button
                    onClick={handleFinalize}
                    disabled={finalizing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {finalizing ? 'Generating...' : 'Generate Invoice'}
                  </Button>
                )}
                {order.status === 'FINALIZED' && (
                  <Button
                    onClick={handleDownloadInvoice}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
              </div>
            </Card>

            {/* Timestamps */}
            {order.finalizedAt && (
              <Card className="bg-gray-900 border-gray-800 p-6">
                <h2 className="text-xl font-semibold mb-4">Timestamps</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="text-white">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Finalized</p>
                    <p className="text-white">{new Date(order.finalizedAt).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
