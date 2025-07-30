import React from 'react';
import { LaundryRequest, STATUS_LABELS } from '../../types';
import { Calendar, Package, CheckCircle, XCircle, Phone, MapPin, CreditCard, Wallet } from 'lucide-react';

interface OrderHistoryProps {
  orders: LaundryRequest[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;