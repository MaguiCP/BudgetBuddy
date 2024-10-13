import jwt from 'jsonwebtoken';
import userSchema from '../validation/userValidation.js';

let users = [];

const registerUser = async (req, res) => {
  try {
    const value = await userSchema.validateAsync(req.body);
    users.push(value);
    return res.status(201).json({ message: 'User registered successfully', user: value });
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
};

const loginUser = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Incluindo a role no token
  return res.status(200).json({ token });
};

export { registerUser, loginUser };
