import express from 'express';
import { registerUser, loginUser, updateUserDetails, getAllUsers, deleteUser, getUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/', registerUser);
router.get('/', getAllUsers);
router.post('/login', loginUser);
router.put('/:id', updateUserDetails);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);

export default router;