import React, { useState } from 'react';
import { X, Plus, Minus, MapPin, Phone, CreditCard, Wallet } from 'lucide-react';
import { Service, ClothQuantity } from '../../types';

interface ServiceSelectorProps {
  services: Service[];
  onCreateOrder: (service: Service, clothes: ClothQuantity, totalCost: number, phone: string, address: string, paymentMethod: string) => void;
  onClose: () => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ services, onCreateOrder, onClose }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentStep, setCurrentStep] = useState<'service' | 'quantity' | 'details' | 'payment'>('service');
  const [quantities, setQuantities] = useState<ClothQuantity>({
    shirt: 0,
    pant: 0,
    dress: 0,
    jacket: 0
  });
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const updateQuantity = (type: keyof ClothQuantity, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + change)
    }));
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    return Object.entries(quantities).reduce((total, [type, qty]) => {
      return total + (qty * selectedService.pricePerCloth[type as keyof ClothQuantity]);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const handleNext = () => {
    if (currentStep === 'service' && selectedService) {
      setCurrentStep('quantity');
    } else if (currentStep === 'quantity' && getTotalItems() > 0) {
      setCurrentStep('details');
    } else if (currentStep === 'details' && phone && address) {
      setCurrentStep('payment');
    }
  };

  const handleBack = () => {
    if (currentStep === 'quantity') {
      setCurrentStep('service');
    } else if (currentStep === 'details') {
      setCurrentStep('quantity');
    } else if (currentStep === 'payment') {
      setCurrentStep('details');
    }
  };

  const handleSubmit = async () => {
    if (selectedService && getTotalItems() > 0 && phone && address) {
      setIsProcessing(true);
      
      // Simulate payment processing
      if (paymentMethod !== 'cash') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      onCreateOrder(selectedService, quantities, calculateTotal(), phone, address, paymentMethod);
      setIsProcessing(false);
    }
  };

  const clothTypes = [
    { key: 'shirt', label: 'Shirts', icon: '👔' },
    { key: 'pant', label: 'Pants', icon: '👖' },
    { key: 'dress', label: 'Dresses', icon: '👗' },
    { key: 'jacket', label: 'Jackets', icon: '🧥' }
  ];

  const getStepTitle = () => {
    switch (currentStep) {
      case 'service': return 'Select Service';
      case 'quantity': return 'Select Quantities';
      case 'details': return 'Delivery Details';
      case 'payment': return 'Payment Method';
      default: return 'Create New Order';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
            <p className="text-sm text-gray-600 mt-1">{getStepTitle()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {['service', 'quantity', 'details', 'payment'].map((step, index) => (
              <div key={step} className={`flex items-center ${index < 3 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step ? 'bg-blue-600 text-white' : 
                  ['service', 'quantity', 'details', 'payment'].indexOf(currentStep) > index ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && <div className={`flex-1 h-1 mx-2 ${
                  ['service', 'quantity', 'details', 'payment'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-300'
                }`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Service Selection */}
          {currentStep === 'service' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Service</h3>
            <div className="grid grid-cols-1 gap-4">
              {services.map(service => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedService?.id === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900">{service.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {Object.entries(service.pricePerCloth).map(([type, price]) => (
                      <span key={type} className="bg-gray-100 px-2 py-1 rounded">
                        {type}: ₹{price}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </div>
          )}

          {/* Quantity Selection */}
          {currentStep === 'quantity' && selectedService && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How many items?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clothTypes.map(({ key, label, icon }) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{icon}</span>
                        <div>
                          <span className="font-medium text-gray-900">{label}</span>
                          <p className="text-sm text-gray-600">
                            ₹{selectedService.pricePerCloth[key as keyof ClothQuantity]} each
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => updateQuantity(key as keyof ClothQuantity, -1)}
                        className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold text-lg">
                        {quantities[key as keyof ClothQuantity]}
                      </span>
                      <button
                        onClick={() => updateQuantity(key as keyof ClothQuantity, 1)}
                        className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Details */}
          {currentStep === 'details' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={3}
                      placeholder="Enter your complete delivery address"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {currentStep === 'payment' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'cash', label: 'Cash on Delivery', icon: Wallet, desc: 'Pay when your order is delivered' },
                  { key: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Pay securely with your card' },
                  { key: 'upi', label: 'UPI Payment', icon: Phone, desc: 'Pay instantly with UPI' }
                ].map(({ key, label, icon: Icon, desc }) => (
                  <div
                    key={key}
                    onClick={() => setPaymentMethod(key as never)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-6 h-6 text-gray-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{label}</h4>
                        <p className="text-sm text-gray-600">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          {selectedService && getTotalItems() > 0 && currentStep !== 'service' && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                {phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{phone}</span>
                  </div>
                )}
                {currentStep === 'payment' && (
                <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{getTotalItems()}</span>
                </div>
                {Object.entries(quantities).map(([type, qty]) => 
                  qty > 0 && (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{type}s:</span>
                      <span>{qty} × ₹{selectedService.pricePerCloth[type as keyof ClothQuantity]} = ₹{qty * selectedService.pricePerCloth[type as keyof ClothQuantity]}</span>
                    </div>
                  )
                )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-medium capitalize">{paymentMethod === 'cash' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}</span>
                  </div>
                </>
                )}
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
                <span className="text-2xl font-bold text-blue-600">₹{calculateTotal()}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentStep !== 'service' && (
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Back
              </button>
            )}
            
            {currentStep !== 'payment' ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 'service' && !selectedService) ||
                  (currentStep === 'quantity' && getTotalItems() === 0) ||
                  (currentStep === 'details' && (!phone || !address))
                }
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Place Order - ₹${calculateTotal()}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelector;