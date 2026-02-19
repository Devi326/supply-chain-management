const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
};

const requireLevel = (level) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    if (parseInt(req.user.user_level) > level) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
    }
    next();
};

module.exports = { protect, requireLevel };
