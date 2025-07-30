import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { LaundryRequest, ORDER_STATUS_FLOW, STATUS_LABELS } from '../../types';
import { Calendar, Package, Clock, MapPin, Phone, CreditCard, Wallet, CheckCircle, DollarSign } from 'lucide-react';
import PaymentPage from './PaymentPage.tsx';

interface OrderCardProps {
  order: LaundryRequest;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [showPaymentPage, setShowPaymentPage] = React.useState(false);

  const handleMarkAsReceived = async () => {
    try {
      await updateDoc(doc(db, 'requests', order.id), {
        status: 'client-confirmed',
        'timestamps.clientConfirmedAt': new Date()
      });
    } catch (error) {
      console.error('Error marking order as received:', error);
    }
  };

  const handlePaymentSuccess = async () => {
    await updateDoc(doc(db, 'requests', order.id), {
      paymentStatus: 'completed',
      'timestamps.paidAt': new Date()
    });
    setShowPaymentPage(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'picked-up': return 'bg-purple-100 text-purple-800';
      case 'out-for-delivery': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'client-confirmed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentStatusIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const progressPercentage = ((currentStatusIndex + 1) / ORDER_STATUS_FLOW.length) * 100;

  const getPaymentIcon = () => {
    switch (order.paymentMethod) {
      case 'cash': return <Wallet className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'upi': return <Phone className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const getPaymentLabel = () => {
    switch (order.paymentMethod) {
      case 'cash': return 'Cash on Delivery';
      case 'card': return 'Card Payment';
      case 'upi': return 'UPI Payment';
      default: return 'Cash on Delivery';
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {order.clientPhone}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-lg font-bold text-gray-900">
              Total: ₹{order.totalCost}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              {getPaymentIcon()}
              <span className="ml-2">{getPaymentLabel()}</span>
            </div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
              order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {order.paymentStatus === 'completed' ? 'Paid' : order.paymentStatus === 'failed' ? 'Payment Failed' : 'Payment Pending'}
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
        {order.deliveryAddress && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Delivery Address:</p>
                <p className="text-sm text-blue-800">{order.deliveryAddress}</p>
              </div>
            </div>
          </div>
        )}
        
        {order.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Notes:</strong> {order.notes}
            </p>
          </div>
        )}

        {/* Payment and Delivery Confirmation */}
        {order.status === 'out-for-delivery' && order.paymentMethod === 'cash' && order.paymentStatus === 'pending' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-1">
                  Payment Required
                </h4>
                <p className="text-sm text-yellow-700">
                  Please complete your cash payment of ₹{order.totalCost} to proceed
                </p>
              </div>
              <button
                onClick={() => setShowPaymentPage(true)}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Pay Now
              </button>
            </div>
          </div>
        )}

        {order.status === 'out-for-delivery' && order.paymentStatus === 'completed' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-green-900 mb-1">
                  Order Out for Delivery
                </h4>
                <p className="text-sm text-green-700">
                  Please confirm once you receive your laundry
                </p>
              </div>
              <button
                onClick={handleMarkAsReceived}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Received
              </button>
            </div>
          </div>
        )}

        {order.status === 'client-confirmed' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Order Received</h4>
                <p className="text-sm text-blue-700">
                  You have confirmed receipt. Waiting for admin to mark as delivered.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Page Modal */}
      {showPaymentPage && (
        <PaymentPage
          amount={order.totalCost}
          paymentMethod={order.paymentMethod as 'cash' | 'card' | 'upi'}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentPage(false)}
        />
      )}
    </div>
  );
};

export default OrderCard;