import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { LaundryRequest, Service, ClothQuantity } from '../../types';
import { Plus, Package, Clock, CheckCircle, LogOut } from 'lucide-react';
import ServiceSelector from './ServiceSelector';
import OrderCard from './OrderCard';
import OrderHistory from './OrderHistory';

const ClientDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [orders, setOrders] = useState<LaundryRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Load services
    const loadServices = async () => {
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const servicesData = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(servicesData);
    };

    // Listen to user's orders
    const q = query(
      collection(db, 'requests'),
      where('clientId', '==', currentUser.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamps: {
          ...doc.data().timestamps,
          placedAt: doc.data().timestamps?.placedAt?.toDate(),
          acceptedAt: doc.data().timestamps?.acceptedAt?.toDate(),
          pickedUpAt: doc.data().timestamps?.pickedUpAt?.toDate(),
          outForDeliveryAt: doc.data().timestamps?.outForDeliveryAt?.toDate(),
          deliveredAt: doc.data().timestamps?.deliveredAt?.toDate(),
        }
      })) as LaundryRequest[];
      
      setOrders(ordersData.sort((a, b) => 
        new Date(b.timestamps.placedAt).getTime() - new Date(a.timestamps.placedAt).getTime()
      ));
      setLoading(false);
    });

    loadServices();

    return () => unsubscribe();
  }, [currentUser]);

  const handleCreateOrder = async (service: Service, clothes: ClothQuantity, totalCost: number, phone: string, address: string, paymentMethod: string) => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'requests'), {
        clientId: currentUser.id,
        clientName: currentUser.name,
        clientPhone: phone,
        deliveryAddress: address,
        service: service.name,
        clothes,
        totalCost,
        status: 'placed',
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed',
        paymentMethod,
        timestamps: {
          placedAt: new Date(),
          ...(paymentMethod !== 'cash' && { paidAt: new Date() })
        }
      });
      setShowNewOrder(false);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const currentOrders = orders.filter(order => 
    !['delivered', 'rejected'].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    ['delivered', 'rejected'].includes(order.status)
  );

  const stats = {
    active: currentOrders.length,
    completed: completedOrders.length,
    total: orders.length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">🧺</span>
                <h1 className="text-xl font-semibold text-gray-900">LaundryApp</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser?.name}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Order Button */}
        <div className="mb-6 flex justify-between">
          <button
            onClick={() => setShowNewOrder(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Order
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('current')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'current'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active Orders ({currentOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order History ({completedOrders.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Orders Content */}
        {activeTab === 'current' ? (
          <div className="space-y-6">
            {currentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
                <p className="text-gray-600 mb-4">Create your first order to get started</p>
                <button
                  onClick={() => setShowNewOrder(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Order
                </button>
              </div>
            ) : (
              currentOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        ) : (
          <OrderHistory orders={completedOrders} />
        )}
      </div>

      {/* Service Selector Modal */}
      {showNewOrder && (
        <ServiceSelector
          services={services}
          onCreateOrder={handleCreateOrder}
          onClose={() => setShowNewOrder(false)}
        />
      )}
    </div>
  );
};

export default ClientDashboard;