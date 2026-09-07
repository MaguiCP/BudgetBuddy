import {
  registerUser as registerUserService,
  loginUser as loginUserService,
  getUserById,
  getAllUsersService,
  updateUserDetails as updateUserService,
  deleteUserById,
} from '../services/userService.js';

const registerUser = async (req, res) => {
  try {
    const user = await registerUserService(req.body);
    return res.status(201).json({ message: 'User registered successfully!', user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const token = await loginUserService(req.body);
    return res.status(200).json({ token });
  } catch (error) {
    const status = error.message === 'Invalid credentials.' ? 401 : 400;
    return res.status(status).json({ error: error.message });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const user = await updateUserService(req.params, req.body);
    return res.status(200).json({ message: 'User updated successfully!', user });
  } catch (error) {
    const status = error.message === 'User not found.' ? 404 : 400;
    return res.status(status).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await deleteUserById(req.params);
    return res.status(200).json({ message: 'User deleted successfully!' });
  } catch (error) {
    const status = error.message === 'User not found.' ? 404 : 400;
    return res.status(status).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params);
    return res.status(200).json({ user });
  } catch (error) {
    const status = error.message === 'User not found.' ? 404 : 400;
    return res.status(status).json({ error: error.message });
  }
};

export { registerUser, loginUser, updateUserDetails, getAllUsers, deleteUser, getUser };