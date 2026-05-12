const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('role permissions email');
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean);

    const isAdmin = user?.role === 'admin' || adminEmails.includes(user?.email);

    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.admin = user;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Admin check failed', error: err.message });
  }
};
