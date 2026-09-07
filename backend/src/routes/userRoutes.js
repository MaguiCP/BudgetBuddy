import express from 'express';
import rateLimit from 'express-rate-limit';

import { registerUser, loginUser, updateUserDetails, getAllUsers, deleteUser, getUser } from '../controllers/userController.js';
import userMiddleware from '../middlewares/userMiddleware.js';

const router = express.Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

router.post('/', registerUser);
router.get('/', userMiddleware, getAllUsers);
router.post('/login', loginRateLimiter, loginUser);
router.put('/:id', userMiddleware, updateUserDetails);
router.get('/:id', userMiddleware, getUser);
router.delete('/:id', userMiddleware, deleteUser);

export default router;