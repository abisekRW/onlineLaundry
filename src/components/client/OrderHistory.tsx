import React, { useState } from 'react';
import { LaundryRequest, STATUS_LABELS } from '../../types';
import { Calendar, Package, CheckCircle, XCircle, Phone, MapPin, CreditCard, Wallet, FlagOff
} from 'lucide-react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface OrderHistoryProps {
  orders: LaundryRequest[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  const [reportReason, setReportReason] = useState<{ [orderId: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [openReportId, setOpenReportId] = useState<string | null>(null); // Track open report by order ID

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === 'rejected') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Package className="w-5 h-5 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentIcon = (paymentMethod?: string) => {
    switch (paymentMethod) {
      case 'cash': return <Wallet className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'upi': return <Phone className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const handleReportSubmit = async (
    e: React.FormEvent,
    orderId: string
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'reports'), {
        orderId,
        reason: reportReason[orderId],
        createdAt: Timestamp.now(),
      });

      setReportReason(prev => ({ ...prev, [orderId]: '' }));
      setOpenReportId(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No order history</h3>
        <p className="text-gray-600">Your completed orders will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {getStatusIcon(order.status)}
              <span className="ml-2 text-sm text-gray-500">Order #{order.id.slice(-8)}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{order.service}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {Object.entries(order.clothes).map(([type, qty]) =>
                  qty > 0 && (
                    <div key={type} className="flex justify-between">
                      <span className="capitalize">{type}s:</span>
                      <span>{qty}</span>
                    </div>
                  )
                )}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-1" />
                {order.clientPhone}
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Placed: {order.timestamps.placedAt.toLocaleDateString()}
              </div>
              {order.timestamps.deliveredAt && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Delivered: {order.timestamps.deliveredAt.toLocaleDateString()}
                </div>
              )}
              <div className="flex items-start mt-2">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs break-words">{order.deliveryAddress}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">₹{order.totalCost}</div>
              <div className="flex items-center justify-end text-sm text-gray-600 mt-1">
                {getPaymentIcon(order.paymentMethod)}
                <span className="ml-1">
                  {order.paymentMethod === 'cash' ? 'COD' : order.paymentMethod?.toUpperCase()}
                </span>
              </div>
              {order.notes && (
                <p className="text-xs text-gray-500 mt-1">{order.notes}</p>
              )}

              {/* Report toggle */}
              <div className="flex justify-start mt-2">
                <button
                  className="text-gray-500 text-sm flex items-center gap-1"
                  onClick={() =>
                    setOpenReportId(prev => (prev === order.id ? null : order.id))
                  }
                >
                  <FlagOff className="h-4 w-4" />
                  Report
                </button>
              </div>

              {/* Report form (only open for selected order) */}
              {openReportId === order.id && (
                <form
                  className="flex flex-col justify-start items-start gap-2 mb-6 p-4"
                  onSubmit={(e) => handleReportSubmit(e, order.id)}
                >
                  <div>
                    <textarea
                      value={reportReason[order.id] || ''}
                      onChange={(e) =>
                        setReportReason(prev => ({
                          ...prev,
                          [order.id]: e.target.value,
                        }))
                      }
                      placeholder="Your Issue..."
                      required
                      className="w-[500px] px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <button
                      className="border px-4 bg-green-600 text-white py-1 rounded-md"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
