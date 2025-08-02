import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Users, 
  Heart,
  HeartOff,
  Phone,
  Mail,
  User,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { IMAGE_BASE_URL, commentsAPI, savedPropertiesAPI } from '../../services/api';

const PropertyDetails = ({ 
  property, 
  isOpen = true, 
  onClose, 
  bookmarkedProperties, 
  toggleBookmark,
  isFullPage = false,
  onBooking 
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddComment, setShowAddComment] = useState(false);
  const [newComment, setNewComment] = useState({
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [isPropertySaved, setIsPropertySaved] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);
  const textareaRef = useRef(null);

  // Check if property is saved
  const checkIfPropertySaved = async () => {
    if (!user || !property?.id) return;
    
    try {
      const response = await savedPropertiesAPI.isPropertySaved(property.id);
      if (response.success) {
        setIsPropertySaved(response.data.isSaved);
      }
    } catch (error) {
      console.error('Error checking if property is saved:', error);
    }
  };

  // Handle saving/unsaving property
  const handleToggleSaveProperty = async () => {
    if (!user) {
      alert('Please login to save properties');
      return;
    }

    if (!property?.id) return;

    try {
      setSavingProperty(true);
      
      if (isPropertySaved) {
        // Remove from saved properties
        const response = await savedPropertiesAPI.removeSavedProperty(property.id);
        if (response.success) {
          setIsPropertySaved(false);
        } else {
          alert('Failed to remove property from saved list');
        }
      } else {
        // Save property
        const response = await savedPropertiesAPI.saveProperty(property.id);
        if (response.success) {
          setIsPropertySaved(true);
        } else {
          alert('Failed to save property');
        }
      }
    } catch (error) {
      console.error('Error toggling save property:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSavingProperty(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      alert('Please login to delete comments');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      const response = await commentsAPI.deleteComment(commentId);
      
      if (response.success) {
        await fetchComments();
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleCommentChange = useCallback((e) => {
    const target = e.target;
    const cursorPosition = target.selectionStart;
    const scrollTop = target.scrollTop;
    
    setNewComment(prev => ({...prev, comment: target.value}));
    
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        textareaRef.current.scrollTop = scrollTop;
      }
    });
  }, []);

  useEffect(() => {
    if (property?.id) {
      fetchComments();
      checkIfPropertySaved();
    }
  }, [property?.id, user]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getPropertyComments(property.id);
      if (response.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  // Extended property data for details view
  const propertyDetails = {
    ...property,
    bedrooms: property.bedrooms || 4,
    bathrooms: property.bathrooms || 3,
    maxOccupants: property.maxOccupancy || 6,
    description: "Escape to this stunning oceanfront paradise where luxury meets comfort. This exquisite villa offers breathtaking panoramic views of the Pacific Ocean, featuring an infinity pool that seems to merge with the horizon. The spacious interior boasts contemporary design with floor-to-ceiling windows, allowing natural light to flood every room.",
    rules: [
      'No smoking inside the property',
      'No pets allowed',
      'Quiet hours: 10 PM - 8 AM',
      `Maximum ${property.maxOccupancy || 6} occupants allowed`,
      'Minimum 3-month rental required',
      'Security deposit required'
    ],
    host: {
      name: 'Sarah Johnson',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@renteasy.com'
    },
    images: [
      ...(property.images && property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800']),
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
    ]
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to add a comment');
      return;
    }

    if (newComment.comment.trim()) {
      const currentScrollPosition = window.pageYOffset;
      
      try {
        setSubmitting(true);
        const response = await commentsAPI.createComment({
          propertyId: property.id,
          comment: newComment.comment.trim()
        });

        if (response.success) {
          await fetchComments();
          setNewComment({ comment: '' });
          setShowAddComment(false);
          
          setTimeout(() => {
            window.scrollTo(0, currentScrollPosition);
          }, 0);
        } else {
          alert('Failed to add comment');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Handle back navigation - goes to previous page
  const handleBackNavigation = () => {
    if (onClose) {
      onClose(); // This will use navigate(-1) from ViewDetails page
    } else {
      window.history.back(); // Fallback
    }
  };

  // Content component
  const PropertyContent = () => (
    <div className="bg-white">
      {/* Close button only for modal mode */}
      {!isFullPage && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      )}
      
      <div className="p-6 max-w-6xl mx-auto">
        {/* Back Button - Only for full page mode */}
        {isFullPage && (
          <div className="mb-6">
            <button
              onClick={handleBackNavigation}
              className="flex items-center text-amber-600 hover:text-amber-700 transition-colors font-semibold group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Previous Page
            </button>
          </div>
        )}

        {/* Property Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3">
                {propertyDetails.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2 text-amber-600" />
                <span className="text-lg">{propertyDetails.location}</span>
              </div>
            </div>
            <button
              onClick={handleToggleSaveProperty}
              disabled={savingProperty}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingProperty ? (
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : isPropertySaved ? (
                <Heart className="w-6 h-6 text-red-500 fill-current" />
              ) : (
                <HeartOff className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Image Gallery - Fixed height to prevent content hiding */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Main image */}
            <div className="md:col-span-3">
              <img
                src={propertyDetails.images && propertyDetails.images[0] ? `${IMAGE_BASE_URL}${propertyDetails.images[0]}` : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300'}
                alt={propertyDetails.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
            </div>
            {/* Thumbnail images */}
            <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
              {propertyDetails.images && propertyDetails.images.slice(1, 4).map((image, index) => (
                <img
                  key={index}
                  src={`${IMAGE_BASE_URL}${image}`}
                  alt={`Property view ${index + 2}`}
                  className="w-full h-20 md:h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-2xl">
              <div className="text-center">
                <Bed className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{propertyDetails.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>
              <div className="text-center">
                <Bath className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{propertyDetails.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
              </div>
              <div className="text-center">
                <Users className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{propertyDetails.maxOccupants}</div>
                <div className="text-sm text-gray-600">Max Occupants</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">About this property</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {propertyDetails.description}
              </p>
            </div>

            {/* House Rules */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">House Rules</h2>
              <ul className="space-y-3">
                {propertyDetails.rules.map((rule, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>


          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 bg-white border border-gray-200 rounded-3xl p-6 shadow-lg">
              {/* Price Section */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center text-3xl font-bold text-slate-900 mb-2">
                  <DollarSign className="w-8 h-8 mr-1" />
                  {propertyDetails.price?.toLocaleString()}
                  <span className="text-lg text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-600">Monthly rental rate</p>
              </div>

              {/* Booking Button */}
              <button 
                onClick={onBooking}
                className="w-full font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg bg-amber-600 text-white hover:bg-amber-700"
              >
                Book This Property
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section - At the bottom, clearly visible */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Comments</h2>
            
            {/* Add Comment Button */}
            {user && (
              <button
                onClick={() => setShowAddComment(!showAddComment)}
                className="mb-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                {showAddComment ? 'Cancel' : 'Write a Comment'}
              </button>
            )}

            {/* Add Comment Form */}
            {showAddComment && (
              <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Share Your Thoughts</h3>
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Comment</label>
                    <textarea
                      ref={textareaRef}
                      value={newComment.comment}
                      onChange={handleCommentChange}
                      onBlur={(e) => {
                        e.preventDefault();
                      }}
                      onFocus={(e) => {
                        e.preventDefault();
                      }}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Share your thoughts about this property..."
                      required
                      minLength={5}
                      maxLength={1000}
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Comment'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddComment(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {user ? 'No comments yet. Be the first to share your thoughts!' : 'No comments yet. Login to add a comment!'}
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <User className="w-10 h-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">
                            {comment.user ? comment.user.name : 'Anonymous'}
                          </h4>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            {user && comment.user && user.id === comment.user.id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={deletingCommentId === comment.id}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete comment"
                              >
                                {deletingCommentId === comment.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Return different wrappers based on mode
  if (isFullPage) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <PropertyContent />
      </div>
    );
  }

  // Modal mode
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative min-h-screen px-4 py-8">
        <div className="relative max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden my-8">
          <PropertyContent />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
