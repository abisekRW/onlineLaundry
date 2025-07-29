import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Service, ClothQuantity } from '../../types';

interface ServiceSelectorProps {
  services: Service[];
  onCreateOrder: (service: Service, clothes: ClothQuantity, totalCost: number) => void;
  onClose: () => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ services, onCreateOrder, onClose }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantities, setQuantities] = useState<ClothQuantity>({
    shirt: 0,
    pant: 0,
    dress: 0,
    jacket: 0
  });

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

  const handleSubmit = () => {
    if (selectedService && getTotalItems() > 0) {
      onCreateOrder(selectedService, quantities, calculateTotal());
    }
  };

  const clothTypes = [
    { key: 'shirt', label: 'Shirts', icon: '👔' },
    { key: 'pant', label: 'Pants', icon: '👖' },
    { key: 'dress', label: 'Dresses', icon: '👗' },
    { key: 'jacket', label: 'Jackets', icon: '🧥' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Service Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Service</h3>
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

          {/* Quantity Selection */}
          {selectedService && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Quantities</h3>
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

          {/* Order Summary */}
          {selectedService && getTotalItems() > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
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
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
                <span className="text-2xl font-bold text-blue-600">₹{calculateTotal()}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedService || getTotalItems() === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Order - ₹{calculateTotal()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelector;