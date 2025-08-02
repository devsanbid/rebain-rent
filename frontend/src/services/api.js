// Simple API service for making HTTP requests to the backend
const API_BASE_URL = 'http://localhost:5000/api';
export const IMAGE_BASE_URL = 'http://localhost:5000';

// Helper function to convert data URL to Blob
const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Helper function to make API requests
const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        errors: data.errors || [],
        status: response.status
      };
    }
    
    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      errors: []
    };
  }
};

// Authentication API calls
export const authAPI = {
  // Login user
  login: async (credentials) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register user
  register: async (userData) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Verify token
  verifyToken: async () => {
    return makeRequest('/auth/verify');
  },

  // Get current user profile
  getProfile: async () => {
    return makeRequest('/auth/profile');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return makeRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
};

// Properties API calls
export const propertiesAPI = {
  // Get all properties with filters
  getProperties: async (filters = {}) => {
    // Clean up undefined values to avoid sending them as 'undefined' strings
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    const queryParams = new URLSearchParams(cleanFilters).toString();
    return makeRequest(`/properties${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get single property
  getProperty: async (id) => {
    return makeRequest(`/properties/${id}`);
  },

  // Create property (admin only)
  createProperty: async (propertyData) => {
    const formData = new FormData();
    
    Object.keys(propertyData).forEach(key => {
      if (key === 'images' && Array.isArray(propertyData[key])) {
        propertyData[key].forEach((image, index) => {
          if (image.startsWith('data:')) {
            const blob = dataURLtoBlob(image);
            formData.append('images', blob, `image_${index}.jpg`);
          }
        });
      } else if (Array.isArray(propertyData[key])) {
        formData.append(key, JSON.stringify(propertyData[key]));
      } else {
        formData.append(key, propertyData[key]);
      }
    });
    
    return makeRequest('/properties', {
      method: 'POST',
      body: formData
    });
  },

  // Update property (admin only)
  updateProperty: async (id, propertyData) => {
    const formData = new FormData();
    
    Object.keys(propertyData).forEach(key => {
      if (key === 'images' && Array.isArray(propertyData[key])) {
        propertyData[key].forEach((image, index) => {
          if (image.startsWith('data:')) {
            const blob = dataURLtoBlob(image);
            formData.append('images', blob, `image_${index}.jpg`);
          }
        });
      } else if (Array.isArray(propertyData[key])) {
        formData.append(key, JSON.stringify(propertyData[key]));
      } else {
        formData.append(key, propertyData[key]);
      }
    });
    
    return makeRequest(`/properties/${id}`, {
      method: 'PUT',
      body: formData
    });
  },

  // Delete property (admin only)
  deleteProperty: async (id) => {
    return makeRequest(`/properties/${id}`, {
      method: 'DELETE',
    });
  },
};

// Bookings API calls
export const bookingsAPI = {
  // Get user bookings
  getUserBookings: async (queryParams = '') => {
    return makeRequest(`/bookings/my-bookings${queryParams}`);
  },

  // Get single booking
  getBooking: async (id) => {
    return makeRequest(`/bookings/${id}`);
  },

  // Create booking
  createBooking: async (bookingData) => {
    return makeRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Cancel booking
  cancelBooking: async (id, cancellationReason = '') => {
    return makeRequest(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    });
  },
};

// Saved Properties API calls
export const savedPropertiesAPI = {
  // Get saved properties
  getSavedProperties: async () => {
    return makeRequest('/saved-properties');
  },

  // Check if property is saved
  isPropertySaved: async (propertyId) => {
    return makeRequest(`/saved-properties/check/${propertyId}`);
  },

  // Save property
  saveProperty: async (propertyId, notes = '') => {
    return makeRequest(`/saved-properties/${propertyId}`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  // Remove saved property
  removeSavedProperty: async (propertyId) => {
    return makeRequest(`/saved-properties/${propertyId}`, {
      method: 'DELETE',
    });
  },
};

// Reviews API calls
export const reviewsAPI = {
  // Get property reviews
  getPropertyReviews: async (propertyId) => {
    return makeRequest(`/reviews/property/${propertyId}`);
  },

  // Get user reviews
  getUserReviews: async () => {
    return makeRequest('/reviews/user');
  },

  // Create review
  createReview: async (reviewData) => {
    return makeRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Delete review
  deleteReview: async (id) => {
    return makeRequest(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// Comments API calls
export const commentsAPI = {
  // Get property comments
  getPropertyComments: async (propertyId, page = 1, limit = 10) => {
    return makeRequest(`/comments/property/${propertyId}?page=${page}&limit=${limit}`);
  },

  // Create comment
  createComment: async (commentData) => {
    return makeRequest('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },

  // Delete comment
  deleteComment: async (id) => {
    return makeRequest(`/comments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Admin API calls
export const adminAPI = {
  // Get dashboard stats
  getDashboardStats: async () => {
    return makeRequest('/admin/dashboard');
  },

  // Get all users
  getAllUsers: async (queryParams = '') => {
    return makeRequest(`/admin/users${queryParams}`);
  },

  // Get all bookings
  getAllBookings: async (queryParams = '') => {
    return makeRequest(`/bookings${queryParams}`);
  },

  // Update booking status
  updateBookingStatus: async (id, status, adminNotes = '') => {
    return makeRequest(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  },

  // Get booking stats
  getBookingStats: async () => {
    return makeRequest('/admin/bookings/stats');
  },

  // Get all comments
  getAllComments: async (queryParams = '') => {
    return makeRequest(`/comments?${queryParams}`);
  },

  // Update comment status
  updateCommentStatus: async (id, status, adminResponse = '') => {
    return makeRequest(`/comments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminResponse }),
    });
  },

  // Get comment stats
  getCommentStats: async () => {
    return makeRequest('/comments/stats');
  },

  // Update user status
  updateUserStatus: async (id, status) => {
    return makeRequest(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Delete user
  deleteUser: async (id) => {
    return makeRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authAPI,
  properties: propertiesAPI,
  bookings: bookingsAPI,
  savedProperties: savedPropertiesAPI,
  reviews: reviewsAPI,
  comments: commentsAPI,
  admin: adminAPI,
};