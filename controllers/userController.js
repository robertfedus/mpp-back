const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const User = require('./../models/User');

module.exports = {
  register: async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
        return res.status(400).json({ message: 'User already exists' });
        }
        user = new User({ email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, 'jwtSecret', { expiresIn: '1h' });
        res.json({ token, id: user._id });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
  },

  protect: (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, 'jwtSecret');
      req.user = decoded.id;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  }
};
