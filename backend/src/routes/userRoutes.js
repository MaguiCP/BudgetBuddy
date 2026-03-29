import express from 'express';
import { registerUser, loginUser, updateUserDetails, getAllUsers, deleteUser, getUser } from '../controllers/userController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 login requests per windowMs
});

router.post('/', registerUser);
router.get('/', getAllUsers);
router.post('/login', loginRateLimiter, loginUser);
router.put('/:id', updateUserDetails);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);

export default router;