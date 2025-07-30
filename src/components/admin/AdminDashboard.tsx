/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { LaundryRequest, OrderStatus, } from '../../types';
import { Package, Users, TrendingUp, Clock, LogOut } from 'lucide-react';
import RequestCard from './RequestCard';

const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [requests, setRequests] = useState<LaundryRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('timestamps.placedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
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
      
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (requestId: string, newStatus: OrderStatus, notes?: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        status: newStatus,
        [`timestamps.${getTimestampKey(newStatus)}`]: new Date()
      };
      
      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(doc(db, 'requests', requestId), updateData);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getTimestampKey = (status: OrderStatus): string => {
    const mapping: Record<OrderStatus, string> = {
      'placed': 'placedAt',
      'accepted': 'acceptedAt',
      'picked-up': 'pickedUpAt',
      'out-for-delivery': 'outForDeliveryAt',
      'delivered': 'deliveredAt',
      'rejected': 'rejectedAt',

    };
    return mapping[status] || 'updatedAt';
  };

  const getFilteredRequests = () => {
    switch (filter) {
      case 'pending':
        return requests.filter(req => req.status === 'placed');
      case 'active':
        return requests.filter(req => 
          !['placed', 'delivered', 'rejected'].includes(req.status)
        );
      case 'completed':
        return requests.filter(req => 
          ['delivered', 'rejected'].includes(req.status)
        );
      default:
        return requests;
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(req => req.status === 'placed').length,
    active: requests.filter(req => 
      !['placed', 'delivered', 'rejected'].includes(req.status)
    ).length,
    completed: requests.filter(req => 
      ['delivered', 'rejected'].includes(req.status)
    ).length,
    revenue: requests
      .filter(req => req.status === 'delivered')
      .reduce((sum, req) => sum + req.totalCost, 0)
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
              <span className="text-2xl font-bold mr-2">🧺</span>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.revenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Orders', count: stats.total },
                { key: 'pending', label: 'Pending', count: stats.pending },
                { key: 'active', label: 'Active', count: stats.active },
                { key: 'completed', label: 'Completed', count: stats.completed }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    filter === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {getFilteredRequests().length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">No orders match the current filter</p>
            </div>
          ) : (
            getFilteredRequests().map(request => (
              <RequestCard
                key={request.id}
                request={request}
                onStatusUpdate={handleStatusUpdate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;