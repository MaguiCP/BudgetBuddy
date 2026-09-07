import express from 'express';
import rateLimit from 'express-rate-limit';

import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/categoryController.js';
import userMiddleware from '../middlewares/userMiddleware.js';

const router = express.Router();

const categoryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

router.post('/', userMiddleware, categoryLimiter, createCategoryController);
router.get('/', userMiddleware, categoryLimiter, getAllCategoriesController);
router.get('/:id', userMiddleware, categoryLimiter, getCategoryController);
router.put('/:id', userMiddleware, categoryLimiter, updateCategoryController);
router.delete('/:id', userMiddleware, categoryLimiter, deleteCategoryController);

export default router;
