import express from 'express';
import { registerUser, loginUser, updateUserDetails, getAllUsers } from '../controllers/userController.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.put('/:id', updateUserDetails);
router.get('/', getAllUsers);

export default router;
