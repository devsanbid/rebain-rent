import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createComment,
  getPropertyComments,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  getCommentStats
} from '../controllers/commentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateId, validatePropertyId, validatePagination } from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many comment requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const validateComment = [
  body('propertyId')
    .isInt({ min: 1 })
    .withMessage('Property ID must be a positive integer'),
  body('comment')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Comment must be between 5 and 1000 characters')
    .trim()
];

router.get('/stats', generalLimiter, authenticate, authorize('admin'), getCommentStats);
router.get('/property/:propertyId', generalLimiter, validatePropertyId, validatePagination, getPropertyComments);
router.get('/', generalLimiter, authenticate, authorize('admin'), validatePagination, getAllComments);

router.post('/',
  commentLimiter,
  authenticate,
  validateComment,
  createComment
);

router.put('/:id/status',
  generalLimiter,
  authenticate,
  authorize('admin'),
  validateId,
  [
    body('status')
      .isIn(['pending', 'approved', 'rejected'])
      .withMessage('Invalid status'),
    body('adminResponse')
      .optional()
      .isString()
      .withMessage('Admin response must be a string')
  ],
  updateCommentStatus
);

router.delete('/:id',
  generalLimiter,
  authenticate,
  validateId,
  deleteComment
);

export default router;