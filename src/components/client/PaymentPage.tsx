import React, { useState } from 'react';
import { X, CreditCard, Wallet, Phone, CheckCircle, Loader2 } from 'lucide-react';

interface PaymentPageProps {
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  onPaymentSuccess: () => void;
  onClose: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ 
  amount, 
  paymentMethod, 
  onPaymentSuccess, 
  onClose 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setPaymentComplete(true);
    
    // Auto close and trigger success after showing success message
    setTimeout(() => {
      onPaymentSuccess();
    }, 2000);
  };

  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case 'cash': return <Wallet className="w-8 h-8 text-green-600" />;
      case 'card': return <CreditCard className="w-8 h-8 text-blue-600" />;
      case 'upi': return <Phone className="w-8 h-8 text-purple-600" />;
      default: return <Wallet className="w-8 h-8 text-green-600" />;
    }
  };

  const getPaymentTitle = () => {
    switch (paymentMethod) {
      case 'cash': return 'Cash Payment Confirmation';
      case 'card': return 'Card Payment';
      case 'upi': return 'UPI Payment';
      default: return 'Payment';
    }
  };

  if (paymentComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Your payment of ₹{amount} has been processed successfully.</p>
          </div>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{getPaymentTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Payment Method Icon */}
          <div className="text-center mb-6">
            {getPaymentIcon()}
            <h3 className="text-lg font-semibold text-gray-900 mt-2">
              Pay ₹{amount}
            </h3>
          </div>

          {/* Cash on Delivery */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Cash Payment Instructions</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Please have exact change ready</li>
                  <li>• Payment will be collected upon delivery</li>
                  <li>• Confirm payment to proceed with delivery</li>
                </ul>
              </div>
              <p className="text-center text-gray-600 text-sm">
                Click confirm to acknowledge cash payment of ₹{amount}
              </p>
            </div>
          )}

          {/* Card Payment */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI Payment */}
          {paymentMethod === 'upi' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@paytm"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  You will receive a payment request on your UPI app. Please approve the transaction to complete the payment.
                </p>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Processing Payment...
              </>
            ) : (
              `${paymentMethod === 'cash' ? 'Confirm' : 'Pay'} ₹${amount}`
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;