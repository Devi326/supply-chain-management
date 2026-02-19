const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const sha1 = (str) => crypto.createHash('sha1').update(str).digest('hex');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        if (user.status === 0) {
            return res.status(403).json({ success: false, message: 'Your account is disabled' });
        }

        // Compare SHA1 passwords
        if (sha1(password) !== user.password) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Update last login
        user.last_login = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user._id, username: user.username, user_level: user.user_level },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                user_level: user.user_level,
                image: user.image
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
