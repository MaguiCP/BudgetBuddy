import jwt from 'jsonwebtoken';
import { validateUserRegistration, validateUserLogin, validateUserId } from '../validation/userValidation.js';
import User, { addUser, updateUser, getUsers } from '../models/User.js';

const registerUser = async (req, res) => {
  try {
    const userData = await validateUserRegistration(req.body);
    const newUser = new User(userData.username, userData.password, userData.email, userData.role);
    addUser(newUser);
    return res.status(201).json({ message: 'User registered successfully!', user: newUser });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = await validateUserLogin(req.body);
    const user = getUsers().find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const { id } = await validateUserId(req.params);
    const existingUser = getUsers().find(u => u.id == id);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updatedUser = {
      ...existingUser,
      ...req.body
    };

    const user = updateUser(id, updatedUser);

    if (!user) {
      return res.status(500).json({ error: 'Error updating user.' });
    }

    return res.status(200).json({ message: 'User updated successfully!', user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getAllUsers = (req, res) => {
  return res.status(200).json(getUsers());
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === Number(id));

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  users.splice(userIndex, 1);
  return res.status(200).json({ message: 'User deleted successfully!' });
};

const getUser = (req, res) => {
  const { id } = req.params;
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === Number(id));

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.status(200).json({ users });
};

export { registerUser, loginUser, updateUserDetails, getAllUsers, deleteUser, getUser };