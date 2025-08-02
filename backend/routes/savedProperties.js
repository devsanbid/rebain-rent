import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getSavedProperties,
  saveProperty,
  unsaveProperty,
  updateSavedPropertyNotes,
  checkIfPropertySaved,
  getSavedPropertiesCount
} from '../controllers/savedPropertyController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateId,
  validatePropertyId,
  validatePagination
} from '../middleware/validation.js';
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

router.get('/', generalLimiter, authenticate, validatePagination, getSavedProperties);
router.get('/count', generalLimiter, authenticate, getSavedPropertiesCount);
router.get('/check/:propertyId', generalLimiter, authenticate, validatePropertyId, checkIfPropertySaved);

router.post('/:propertyId',
  generalLimiter,
  authenticate,
  validatePropertyId,
  [
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string')
  ],
  saveProperty
);

router.delete('/:propertyId',
  generalLimiter,
  authenticate,
  validatePropertyId,
  unsaveProperty
);

router.put('/:propertyId/notes',
  generalLimiter,
  authenticate,
  validatePropertyId,
  [
    body('notes')
      .isString()
      .withMessage('Notes must be a string')
  ],
  updateSavedPropertyNotes
);

export default router;