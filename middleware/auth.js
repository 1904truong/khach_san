const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // support tokens with either "id" or "userId" and "role"
    const userId = decoded.id || decoded.userId;
    const userRole = decoded.role || decoded.userRole;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // attach core identity to request for controllers
    req.userId = userId;
    if (userRole) req.userRole = userRole;

    // optional DB lookup: keep behavior but do not break basic auth shape
    const user = await User.findByPk(userId);
    if (!user) {
      // keep previous strict behavior if that’s required by the app
      return res.status(401).json({ message: 'Invalid token user' });
    }

    req.user = user;
    // ensure role is always available from DB as well
    if (!req.userRole && user.role) req.userRole = user.role;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  const roleFromReq = req.userRole || (req.user && req.user.role);
  if (roleFromReq !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};

module.exports = { auth, adminOnly };