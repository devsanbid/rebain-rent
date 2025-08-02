import { Op } from 'sequelize';
import { Comment, Property, User } from '../models/index.js';

export const createComment = async (req, res) => {
  try {
    const { propertyId, comment } = req.body;

    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const newComment = await Comment.create({
      userId: req.user.id,
      propertyId,
      comment
    });

    const commentWithUser = await Comment.findByPk(newComment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: {
        comment: commentWithUser
      }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getPropertyComments = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        propertyId,
        status: 'approved'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalComments: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching property comments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all';
    const search = req.query.search || '';

    let whereClause = {};
    if (status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.comment = {
        [Op.iLike]: `%${search}%`
      };
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'location']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalComments: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all comments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await comment.update({
      status,
      adminResponse: adminResponse || null
    });

    const updatedComment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'location']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Comment status updated successfully',
      data: {
        comment: updatedComment
      }
    });
  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (req.user.role !== 'admin' && comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    await comment.destroy();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCommentStats = async (req, res) => {
  try {
    const totalComments = await Comment.count();
    const approvedComments = await Comment.count({ where: { status: 'approved' } });
    const pendingComments = await Comment.count({ where: { status: 'pending' } });
    const rejectedComments = await Comment.count({ where: { status: 'rejected' } });

    const recentComments = await Comment.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        stats: {
          total: totalComments,
          approved: approvedComments,
          pending: pendingComments,
          rejected: rejectedComments
        },
        recentComments
      }
    });
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};