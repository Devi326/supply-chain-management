const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // SHA1 hash
    user_level: { type: Number, required: true },
    image: { type: String, default: 'no_image.jpg' },
    status: { type: Number, default: 1 }, // 1=active, 0=inactive
    last_login: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
