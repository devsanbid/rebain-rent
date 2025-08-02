import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
  createAdmin,
  getSystemHealth
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  validateId,
  validatePagination,
  validateRegister
} from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();


router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/system-health', getSystemHealth);
router.get('/users', validatePagination, getAllUsers);
router.get('/users/:id', validateId, getUserById);

router.post('/create-admin',
  validateRegister,
  createAdmin
);

router.put('/users/:id/status',
  validateId,
  [
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('Invalid status'),
    body('accountType')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Invalid account type'),
    body('verified')
      .optional()
      .isBoolean()
      .withMessage('Verified must be a boolean')
  ],
  updateUserStatus
);

router.delete('/users/:id',
  validateId,
  deleteUser
);

export default router;
