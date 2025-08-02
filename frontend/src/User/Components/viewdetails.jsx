import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { propertiesAPI } from '../../services/api';
// Remove ArrowLeft import since we're not using the back button anymore
import DashboardHeader from '../Components/DashboardHeader';
import PropertyDetails from '../Components/PropertyDetails';
import Footer from '../Components/Footer';

const ViewDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [bookmarkedProperties, setBookmarkedProperties] = useState([]);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const toggleBookmark = (propertyId) => {
    setBookmarkedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  // Loading state
  if (loading || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    navigate(`/booking/${property.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader currentPage="viewdetails" bookmarkedCount={bookmarkedProperties.length} />
      
      {/* REMOVE THIS ENTIRE SECTION - Back Navigation */}
      {/* 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <button
          onClick={handleClose}
          className="flex items-center text-amber-600 hover:text-amber-700 transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Properties
        </button>
      </div>
      */}

      {/* Property Details - Full Page */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <PropertyDetails
          property={property}
          isOpen={true}
          onClose={handleClose}
          bookmarkedProperties={bookmarkedProperties}
          toggleBookmark={toggleBookmark}
          isFullPage={true} // Renders as full page, not modal
          onBooking={handleBooking}
        />
      </div>

      <Footer />
    </div>
  );
};

export default ViewDetails;
