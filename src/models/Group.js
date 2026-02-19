const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    group_name: { type: String, required: true },
    group_level: { type: Number, required: true, unique: true },
    group_status: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
