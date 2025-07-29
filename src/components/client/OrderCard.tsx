import React from 'react';
import { LaundryRequest, ORDER_STATUS_FLOW, STATUS_LABELS } from '../../types';
import { Calendar, Package, Clock, MapPin } from 'lucide-react';

interface OrderCardProps {
  order: LaundryRequest;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'picked-up': return 'bg-purple-100 text-purple-800';
      case 'washing': return 'bg-blue-100 text-blue-800';
      case 'ironing': return 'bg-orange-100 text-orange-800';
      case 'packing': return 'bg-indigo-100 text-indigo-800';
      case 'out-for-delivery': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentStatusIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const progressPercentage = ((currentStatusIndex + 1) / ORDER_STATUS_FLOW.length) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-500">Order #{order.id.slice(-8)}</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{order.service}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              {Object.entries(order.clothes).map(([type, qty]) => 
                qty > 0 && (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type}s:</span>
                    <span>{qty}</span>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {order.timestamps.placedAt.toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {order.timestamps.placedAt.toLocaleTimeString()}
            </div>
            <div className="text-lg font-bold text-gray-900">
              Total: ₹{order.totalCost}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Status Timeline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ORDER_STATUS_FLOW.slice(0, 8).map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return (
              <div 
                key={status}
                className={`text-xs text-center p-2 rounded ${
                  isCompleted 
                    ? isCurrent 
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {STATUS_LABELS[status]}
              </div>
            );
          })}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Notes:</strong> {order.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;