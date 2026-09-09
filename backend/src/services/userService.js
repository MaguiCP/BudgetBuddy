import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { getJwtSecret } from '../config/env.js';
import User from '../models/User.js';
import {
  addUser,
  deleteUser,
  findUserById,
  findUserByUsername,
  getUsers,
  updateUser,
} from '../repositories/userRepository.js';
import { validateUserLogin, validateUserRegistration, validateUserId } from '../validation/userValidation.js';

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const safeUser = { ...user };
  delete safeUser.password;

  return safeUser;
};

export const registerUser = async (userData) => {
  const validatedUser = await validateUserRegistration(userData);
  const existingUser = findUserByUsername(validatedUser.username);

  if (existingUser) {
    throw new Error('Username already exists.');
  }

  const hashedPassword = await bcrypt.hash(validatedUser.password, 10);
  const newUser = new User(validatedUser.username, hashedPassword, validatedUser.email, validatedUser.role);
  addUser(newUser);

  return sanitizeUser(newUser);
};

export const loginUser = async (credentials) => {
  const validatedCredentials = await validateUserLogin(credentials);
  const user = findUserByUsername(validatedCredentials.username);

  if (!user) {
    throw new Error('Invalid credentials.');
  }

  const isPasswordValid = await bcrypt.compare(validatedCredentials.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials.');
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    getJwtSecret(),
    { expiresIn: '1h' }
  );

  return token;
};

export const getUserById = async (idData) => {
  const { id } = await validateUserId(idData);
  const user = findUserById(id);

  if (!user) {
    throw new Error('User not found.');
  }

  return sanitizeUser(user);
};

export const getAllUsersService = () => getUsers().map((user) => sanitizeUser(user));

export const updateUserDetails = async (idData, payload) => {
  const { id } = await validateUserId(idData);
  const existingUser = findUserById(id);

  if (!existingUser) {
    throw new Error('User not found.');
  }

  const updatedUser = { ...existingUser, ...payload };

  if (payload.password) {
    updatedUser.password = await bcrypt.hash(payload.password, 10);
  }

  const user = updateUser(id, updatedUser);

  if (!user) {
    throw new Error('Error updating user.');
  }

  return sanitizeUser(user);
};

export const deleteUserById = async (idData) => {
  const { id } = await validateUserId(idData);
  const deleted = deleteUser(id);

  if (!deleted) {
    throw new Error('User not found.');
  }

  return true;
};
