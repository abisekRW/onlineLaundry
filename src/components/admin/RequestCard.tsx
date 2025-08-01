import React, { useState, useEffect } from 'react';
import { Calendar, User, Package, ChevronRight, MessageSquare, Check, X, Phone, MapPin, CreditCard, Wallet, CheckCircle} from 'lucide-react';
import { LaundryRequest, OrderStatus, ORDER_STATUS_FLOW, STATUS_LABELS } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface RequestCardProps {
  request: LaundryRequest;
  onStatusUpdate: (requestId: string, newStatus: OrderStatus, notes?: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onStatusUpdate }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(request.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showreport, setShowreport] = useState(false);
  const [reportData, setReportData] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const q = query(collection(db, 'reports'), where('orderId', '==', request.id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setReportData(data.reason || 'No reason provided');
      } else {
        setReportData(null);
      }
    };

    if (showreport) {
      fetchReport();
    }
  }, [showreport, request.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'picked-up': return 'bg-purple-100 text-purple-800';
      case 'out-for-delivery':
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'client-confirmed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (): OrderStatus | null => {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(request.status);
    if (currentIndex >= 0 && currentIndex < ORDER_STATUS_FLOW.length - 1) {
      return ORDER_STATUS_FLOW[currentIndex + 1];
    }
    if (request.status === 'client-confirmed') return 'delivered';
    return null;
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    await onStatusUpdate(request.id, newStatus, notes);
    setIsUpdating(false);
  };

  const handleAccept = () => handleStatusUpdate('accepted');
  const handleReject = () => handleStatusUpdate('rejected');

  const handleNextStatus = () => {
    const nextStatus = getNextStatus();
    if (nextStatus && (nextStatus !== 'delivered' || request.paymentStatus === 'completed')) {
      handleStatusUpdate(nextStatus);
    }
  };

  const getPaymentIcon = () => {
    switch (request.paymentMethod) {
      case 'cash': return <Wallet className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'upi': return <Phone className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const getPaymentLabel = () => {
    switch (request.paymentMethod) {
      case 'cash': return 'Cash on Delivery';
      case 'card': return 'Card Payment';
      case 'upi': return 'UPI Payment';
      default: return 'Cash on Delivery';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">#{request.id.slice(-8)}</span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm font-medium text-gray-900">{request.clientName}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-600">{request.clientPhone}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {STATUS_LABELS[request.status]}
          </span>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.service}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              {Object.entries(request.clothes).map(([type, qty]) =>
                qty > 0 && (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type}s:</span>
                    <span className="font-medium">{qty}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Placed: {request.timestamps.placedAt.toLocaleDateString()} at {request.timestamps.placedAt.toLocaleTimeString()}
            </div>
            {request.timestamps.acceptedAt && (
              <div className="flex items-center text-blue-600">
                <Check className="w-4 h-4 mr-2" />
                Accepted: {request.timestamps.acceptedAt.toLocaleDateString()}
              </div>
            )}
            {request.timestamps.deliveredAt && (
              <div className="flex items-center text-green-600">
                <Check className="w-4 h-4 mr-2" />
                Delivered: {request.timestamps.deliveredAt.toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="break-words">{request.deliveryAddress}</span>
            </div>
            <div className="flex items-center">
              {getPaymentIcon()}
              <span className="ml-2">{getPaymentLabel()}</span>
            </div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${request.paymentStatus === 'completed' ? 'bg-green-100 text-green-800'
                : request.paymentStatus === 'failed' ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
              {request.paymentStatus === 'completed' ? 'Paid'
                : request.paymentStatus === 'failed' ? 'Payment Failed'
                  : 'Payment Pending'}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-2">₹{request.totalCost}</div>
            <div className='flex justify-between'>
              <button
                className='inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors mb-2'
                onClick={() => setShowreport(!showreport)}
              >
                Report
              </button>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors mb-2"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                {request.notes ? 'View Notes' : 'Add Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Report Section */}
        {showreport && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reported Issue</label>
            {reportData ? (
              <div className="text-sm text-red-600 border border-red-300 rounded p-3 bg-red-50">
                {reportData}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No report submitted for this order.</div>
            )}
          </div>
        )}

        {/* Notes Section */}
        {showNotes && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Add notes about this order..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {request.status === 'placed' && (
            <>
              <button
                onClick={handleAccept}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept Order
              </button>
              <button
                onClick={handleReject}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4 mr-2" />
                Reject Order
              </button>
            </>
          )}

          {request.status !== 'placed' && request.status !== 'delivered' &&
            request.status !== 'rejected' && getNextStatus() && (
              <button
                onClick={handleNextStatus}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Move to {STATUS_LABELS[getNextStatus()!]}
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            )}

          {request.status === 'client-confirmed' && (
            <button
              onClick={() => handleStatusUpdate('delivered')}
              disabled={isUpdating}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Delivered
            </button>
          )}

          {showNotes && notes !== request.notes && (
            <button
              onClick={() => handleStatusUpdate(request.status)}
              disabled={isUpdating}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Notes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
