import User from '../models/User.js';

const users = [];

export const addUser = (user) => {
  users.push(user);
  return user;
};

export const getUsers = () => users;

export const findUserById = (id) => {
  return users.find((user) => user.id === Number(id));
};

export const findUserByUsername = (username) => {
  return users.find((user) => user.username.toLowerCase() === username.toLowerCase());
};

export const updateUser = (id, updatedUser) => {
  const index = users.findIndex((user) => user.id === Number(id));

  if (index === -1) {
    return null;
  }

  users[index] = { ...users[index], ...updatedUser };
  return users[index];
};

export const deleteUser = (id) => {
  const index = users.findIndex((user) => user.id === Number(id));

  if (index === -1) {
    return false;
  }

  users.splice(index, 1);
  return true;
};

export default User;
