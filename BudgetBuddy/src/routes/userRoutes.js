import express from 'express';
import { registerUser, loginUser, updateUserDetails, getAllUsers, deleteUser, getUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.put('/:id', updateUserDetails);
router.get('/:id', getUser);
router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

export default router;