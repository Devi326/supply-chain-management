const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    buy_price: { type: Number, required: true },
    sale_price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
