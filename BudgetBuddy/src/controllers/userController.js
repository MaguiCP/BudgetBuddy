import jwt from 'jsonwebtoken';
import { validateUserRegistration, validateUserLogin, validateUserId } from '../validation/userValidation.js';
import { addUser, updateUser, getUsers } from '../models/User.js';
import User from '../models/User.js';

const registerUser = async (req, res) => {
  try {
    const userData = await validateUserRegistration(req.body);
    const newUser = new User(userData.username, userData.password, userData.email, userData.role);
    addUser(newUser);
    return res.status(201).json({ message: 'User registered successfully!', user: newUser });
  } catch (error) {
    const message = error.details && error.details[0] ? error.details[0].message : 'Validation error';
    return res.status(400).json({ message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = await validateUserLogin(req.body);
    const user = getUsers().find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const { id } = await validateUserId(req.params);
    const updatedUser = req.body;

    const user = updateUser(id, updatedUser);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ message: 'User updated successfully!', user });
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
};

const getAllUsers = (req, res) => {
  return res.status(200).json(getUsers());
};

export { registerUser, loginUser, updateUserDetails, getAllUsers };