import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, CheckCircle } from 'lucide-react';
import { propertiesAPI, bookingsAPI } from '../../services/api';
import DashboardHeader from '../Components/DashboardHeader';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    contactInfo: {
      phone: '',
      email: ''
    }
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await propertiesAPI.getProperty(id);
        if (response.success) {
          setProperty(response.data.property);
        } else {
          navigate('/overview');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        navigate('/overview');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    } else {
      navigate('/overview');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate && property) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const monthlyRate = property.price || 0;
      const dailyRate = monthlyRate / 30;
      setTotalAmount(Math.round(diffDays * dailyRate));
    }
  }, [bookingData.startDate, bookingData.endDate, property]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setIsBooking(true);

    try {
      const bookingPayload = {
        propertyId: parseInt(id),
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        guests: parseInt(bookingData.guests),
        totalAmount: totalAmount,
        contactInfo: bookingData.contactInfo
      };

      const response = await bookingsAPI.createBooking(bookingPayload);
      
      if (response.success) {
        setBookingConfirmed(true);
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        alert('Booking failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading property details...</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Property not found</div>
        </div>
      </div>
    );
  }

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Your booking for {property.title} has been confirmed.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to order history in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Property Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <p className="text-gray-600">{property.location}</p>
            <div className="flex items-center mt-4">
              <DollarSign className="w-5 h-5 text-amber-600 mr-1" />
              <span className="text-2xl font-bold text-gray-900">
                ${property.price?.toLocaleString()}/month
              </span>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleBooking} className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book This Property</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Check-in Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Check-in Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={bookingData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Check-out Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Check-out Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={bookingData.endDate}
                  onChange={handleInputChange}
                  min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Number of Guests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Number of Guests
                </label>
                <select
                  name="guests"
                  value={bookingData.guests}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {[...Array(property.maxOccupancy || 6)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Guest{i + 1 > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  value={bookingData.contactInfo.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="contactInfo.email"
                  value={bookingData.contactInfo.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Total Amount */}
            {totalAmount > 0 && (
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-amber-600">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isBooking || !totalAmount}
                className="w-full bg-amber-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isBooking ? 'Processing...' : `Confirm Booking - $${totalAmount.toLocaleString()}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;