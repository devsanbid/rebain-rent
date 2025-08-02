import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import DashboardHeader from '../Components/DashboardHeader';

const OrderHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingsAPI.getUserBookings();
        if (response.success) {
          setBookings(response.data.bookings || []);
        } else {
          setError('Failed to load bookings');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await bookingsAPI.cancelBooking(bookingId);
        if (response.success) {
          setBookings(prev => 
            prev.map(booking => 
              booking.id === bookingId 
                ? { ...booking, status: 'cancelled' }
                : booking
            )
          );
        } else {
          alert('Failed to cancel booking');
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading your bookings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">View and manage your property bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't made any bookings yet. Start exploring properties to make your first booking!
            </p>
            <button
              onClick={() => window.location.href = '/overview'}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {booking.Property?.title || 'Property Title'}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{booking.Property?.location || 'Location'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        <span className="flex items-center">
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status}</span>
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-amber-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="font-semibold">
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-amber-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="font-semibold">
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-amber-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Guests</p>
                        <p className="font-semibold">{booking.guests}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-amber-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-semibold">${booking.totalAmount?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {booking.contactInfo && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {booking.contactInfo.phone && (
                          <div>
                            <span className="text-gray-500">Phone: </span>
                            <span className="font-medium">{booking.contactInfo.phone}</span>
                          </div>
                        )}
                        {booking.contactInfo.email && (
                          <div>
                            <span className="text-gray-500">Email: </span>
                            <span className="font-medium">{booking.contactInfo.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                    
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;