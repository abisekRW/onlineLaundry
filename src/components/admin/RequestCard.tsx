import React, { useState } from 'react';
import { LaundryRequest, OrderStatus, ORDER_STATUS_FLOW, STATUS_LABELS } from '../../types';
import { Calendar, User, Package, ChevronRight, MessageSquare, Check, X } from 'lucide-react';

interface RequestCardProps {
  request: LaundryRequest;
  onStatusUpdate: (requestId: string, newStatus: OrderStatus, notes?: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onStatusUpdate }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(request.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const getNextStatus = (): OrderStatus | null => {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(request.status);
    if (currentIndex >= 0 && currentIndex < ORDER_STATUS_FLOW.length - 1) {
      return ORDER_STATUS_FLOW[currentIndex + 1];
    }
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
    if (nextStatus) {
      handleStatusUpdate(nextStatus);
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
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {STATUS_LABELS[request.status]}
          </span>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-2">₹{request.totalCost}</div>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              {request.notes ? 'View Notes' : 'Add Notes'}
            </button>
          </div>
        </div>

        {/* Notes Section */}
        {showNotes && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Notes
            </label>
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

          {request.status !== 'placed' && 
           request.status !== 'delivered' && 
           request.status !== 'rejected' && 
           getNextStatus() && (
            <button
              onClick={handleNextStatus}
              disabled={isUpdating}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Move to {STATUS_LABELS[getNextStatus()!]}
              <ChevronRight className="w-4 h-4 ml-2" />
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