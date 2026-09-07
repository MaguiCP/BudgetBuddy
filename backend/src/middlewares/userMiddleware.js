import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/env.js';

const userMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  jwt.verify(token, getJwtSecret(), (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    req.user = decoded;
    next();
  });
};

export default userMiddleware;
