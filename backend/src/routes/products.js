const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Media = require('../models/Media');
const { protect, requireLevel } = require('../middleware/auth');

// @route   GET /api/products
router.get('/', protect, requireLevel(3), async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name')
            .populate('image', 'file_name')
            .sort({ createdAt: -1 });

        const result = products.map(p => ({
            ...p.toObject(),
            id: p._id,
            category: p.category?.name || 'N/A',
            image: p.image?.file_name || 'no_image.jpg'
        }));

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/products
router.post('/', protect, requireLevel(2), async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            category: req.body.categorie_id // Support old field name from frontend
        });
        await product.save();
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   PUT /api/products/:id
router.put('/:id', protect, requireLevel(2), async (req, res) => {
    try {
        if (req.body.categorie_id) req.body.category = req.body.categorie_id;
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   DELETE /api/products/:id
router.delete('/:id', protect, requireLevel(2), async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/products/top
router.get('/top', protect, requireLevel(3), async (req, res) => {
    try {
        // Basic top products simulation since we don't have sales populated yet
        const products = await Product.find().limit(parseInt(req.query.limit) || 5);
        res.json({ success: true, data: products.map(p => ({ ...p.toObject(), totalQty: 0, totalSold: 0 })) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
