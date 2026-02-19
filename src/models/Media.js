const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    file_name: { type: String, required: true },
    file_type: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Media', MediaSchema);
