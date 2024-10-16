class User {
  constructor(username, password, email, role) {
    this.id = User.generateId();
    this.username = username;
    this.password = password;
    this.email = email;
    this.role = role || 'user';
  }

  static generateId() {
    return Math.floor(Math.random() * 1000000);
  }
}

let users = [];

export const addUser = (user) => {
  users.push(user);
};

export const findUserById = (id) => {
  return users.find(user => user.id === id);
};

export const updateUser = (id, updatedUser) => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    return users[index];
  }
  return null;
};

export const getUsers = () => users;

export default User; 