import React, { useState, useEffect } from 'react';
import { Bookmark, Home, X, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardHeader from '../Components/DashboardHeader';
import PropertyCard from '../Components/PropertyCard';
import Footer from '../Components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { savedPropertiesAPI } from '../../services/api';

const SavedProperties = () => {
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Fetch saved properties from backend
  const fetchSavedProperties = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await savedPropertiesAPI.getSavedProperties();
      setSavedProperties(response.data.savedProperties || []);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
      setError(error.response?.data?.message || 'Failed to load saved properties');
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a property from saved list
  const handleRemoveBookmark = async (propertyId) => {
    if (!user) {
      alert('Please login to manage saved properties');
      return;
    }

    try {
      const response = await savedPropertiesAPI.removeSavedProperty(propertyId);
      if (response.success) {
        setSavedProperties(prev => prev.filter(item => item.property.id !== propertyId));
      } else {
        alert('Failed to remove property from saved list');
      }
    } catch (error) {
      console.error('Error removing saved property:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Handle clearing all saved properties
  const handleClearAll = async () => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to remove all saved properties?')) {
      return;
    }

    try {
      // Remove each property individually
      const removePromises = savedProperties.map(item => 
        savedPropertiesAPI.removeSavedProperty(item.property.id)
      );
      
      await Promise.all(removePromises);
      setSavedProperties([]);
    } catch (error) {
      console.error('Error clearing saved properties:', error);
      alert('An error occurred while clearing saved properties');
    }
  };

  useEffect(() => {
    fetchSavedProperties();
  }, [user]);

  const toggleBookmark = handleRemoveBookmark;

  // STATIC ROUTING: Navigate to /viewdetails (no dynamic ID)
  const handleViewDetails = (property) => {
    console.log('Navigating to details for:', property);
    // Navigate to STATIC route '/viewdetails' and pass property data via state
    navigate('/viewdetails', { 
      state: { 
        property: property
      } 
    });
  };

  // Enhanced PropertyCardWithHover component - REMOVED X BUTTON
  const PropertyCardWithHover = ({ property }) => {
    return (
      <div
        className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        onMouseEnter={() => setHoveredCard(property.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => handleViewDetails(property)} // Uses static routing
      >
        {/* Hover Overlay with "View Details" */}
        <div 
          className={`absolute inset-0 bg-black/60 z-10 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 ${
            hoveredCard === property.id ? 'backdrop-blur-sm' : ''
          }`}
        >
          <div className="text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-8 h-8 mx-auto mb-2" />
            <span className="text-lg font-semibold">View Details</span>
            <p className="text-sm opacity-90 mt-1">Click to explore</p>
          </div>
        </div>

        {/* Enhanced PropertyCard with better hover states */}
        <div className="relative">
          <PropertyCard 
            property={property} 
            showBookmarkButton={true} // Keep heart button visible for unsaving
            bookmarkedProperties={savedProperties.map(item => item.property.id)}
            toggleBookmark={toggleBookmark} // This will handle unsaving when heart is clicked
            onViewDetails={() => handleViewDetails(property)} // Uses static routing
            className="group-hover:shadow-xl transition-all duration-300"
          />
          
          {/* Click indicator badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-medium text-gray-700">Click to view</span>
          </div>

          {/* Helper text for heart button */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-medium text-gray-700">💖 Click heart to unsave</span>
          </div>
        </div>
      </div>
    );
  };

  const bookmarkedPropertiesList = savedProperties.map(item => item.property);

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <DashboardHeader currentPage="saved" bookmarkedCount={0} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
          <div className="text-center py-24">
            <div className="w-32 h-32 bg-gradient-to-r from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <Bookmark className="w-16 h-16 text-amber-600" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Please Login</h3>
            <p className="text-xl text-slate-600 mb-10 max-w-md mx-auto">
              You need to be logged in to view your saved properties.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full hover:from-amber-700 hover:to-amber-800 transition-all duration-200 font-semibold text-lg shadow-lg"
            >
              Login
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader currentPage="saved" bookmarkedCount={savedProperties.length} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">
              Your Saved Properties
            </h2>
            <p className="text-xl text-slate-600">
              {savedProperties.length} properties you've bookmarked
            </p>
            {/* Added helper text */}
            <p className="text-sm text-gray-500 mt-2">
              💡 Click the heart icon on any property to remove it from your saved list
            </p>
          </div>
          
          {/* Clear All Button */}
          {savedProperties.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-slate-600">Loading your saved properties...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <div className="w-32 h-32 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <X className="w-16 h-16 text-red-600" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Error Loading Properties</h3>
            <p className="text-xl text-slate-600 mb-10 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={fetchSavedProperties}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full hover:from-amber-700 hover:to-amber-800 transition-all duration-200 font-semibold text-lg shadow-lg"
            >
              Try Again
            </button>
          </div>
        ) : savedProperties.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-32 h-32 bg-gradient-to-r from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <Bookmark className="w-16 h-16 text-amber-600" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">No saved properties yet</h3>
            <p className="text-xl text-slate-600 mb-10 max-w-md mx-auto">
              Start exploring our exceptional properties and save your favorites by clicking the heart icon.
            </p>
            <Link
              to="/browse"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full hover:from-amber-700 hover:to-amber-800 transition-all duration-200 font-semibold text-lg shadow-lg"
            >
              <Home className="w-5 h-5 mr-3" />
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {savedProperties.map(item => (
              <PropertyCardWithHover
                key={item.property.id}
                property={item.property}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SavedProperties;
