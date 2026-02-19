const User = require('./src/models/User');
const Group = require('./src/models/Group');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const crypto = require('crypto');
const connectDB = require('./src/config/db');

const sha1 = (str) => crypto.createHash('sha1').update(str).digest('hex');

async function seed() {
    await connectDB();

    // Clear existing
    await User.deleteMany({});
    await Group.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Groups
    const adminGroup = await Group.create({ group_name: 'Admin', group_level: 1 });
    const managerGroup = await Group.create({ group_name: 'Manager', group_level: 2 });
    const userGroup = await Group.create({ group_name: 'Customer', group_level: 3 });

    // Admin User
    await User.create({
        name: 'Default Admin',
        username: 'Admin',
        password: sha1('admin123'),
        user_level: 1
    });

    // Manager User
    await User.create({
        name: 'Product Manager',
        username: 'Manager',
        password: sha1('manager123'),
        user_level: 2
    });

    // Customer / Regular User
    await User.create({
        name: 'Regular Staff',
        username: 'User',
        password: sha1('user123'),
        user_level: 3
    });

    // Sample Categories
    const motors = await Category.create({ name: 'EV Motors' });
    const batteries = await Category.create({ name: 'Batteries' });

    // Sample Product
    await Product.create({
        name: 'Hub Motor 900W',
        quantity: 50,
        buy_price: 8000,
        sale_price: 12500,
        category: motors._id
    });

    console.log('Database Seeded Successfully!');
    process.exit();
}

seed();
