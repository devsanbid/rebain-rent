import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Trash2, MessageSquare, User, Calendar, Building } from 'lucide-react';
import AdminDashboardHeader from '../Components/AdminDashboardHeader';
import { adminAPI } from '../../services/api';

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [selectedComment, setSelectedComment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [statusFilter, searchTerm]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (searchTerm) queryParams.append('search', searchTerm);
      
      const response = await adminAPI.getAllComments(queryParams.toString());
      if (response.success) {
        setComments(response.data.comments);
      } else {
        setError('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getCommentStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (commentId, newStatus) => {
    try {
      const response = await adminAPI.updateCommentStatus(commentId, newStatus, adminResponse);
      if (response.success) {
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, status: newStatus, adminResponse }
              : comment
          )
        );
        setShowModal(false);
        setSelectedComment(null);
        setAdminResponse('');
        fetchStats();
      } else {
        alert('Failed to update comment status');
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
      alert('Failed to update comment status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Eye className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openModal = (comment) => {
    setSelectedComment(comment);
    setAdminResponse(comment.adminResponse || '');
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminDashboardHeader currentPage="comments" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminDashboardHeader currentPage="comments" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader currentPage="comments" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Comments Management</h1>
          <p className="text-gray-600">Manage and moderate property comments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Check className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <X className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {comments.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No comments found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {comments.map((comment) => (
                <div key={comment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {comment.property ? comment.property.title : 'Unknown Property'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{comment.comment}</p>
                      {comment.adminResponse && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                          <p className="text-sm text-blue-700">
                            <strong>Admin Response:</strong> {comment.adminResponse}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(comment.status)}`}>
                        {getStatusIcon(comment.status)}
                        <span className="ml-1 capitalize">{comment.status}</span>
                      </span>
                      <button
                        onClick={() => openModal(comment)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Comment</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Comment Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>User:</strong> {selectedComment.user ? `${selectedComment.user.firstName} ${selectedComment.user.lastName}` : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Property:</strong> {selectedComment.property ? selectedComment.property.title : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Date:</strong> {new Date(selectedComment.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">{selectedComment.comment}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Response (Optional)
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a response to this comment..."
                />
              </div>

              <div className="flex justify-between">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedComment.id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedComment.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedComment.id, 'pending')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Mark Pending
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedComment(null);
                    setAdminResponse('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComments;