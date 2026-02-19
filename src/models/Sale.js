const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    tx_hash: { type: String } // For blockchain reference
}, { timestamps: true });

module.exports = mongoose.model('Sale', SaleSchema);
