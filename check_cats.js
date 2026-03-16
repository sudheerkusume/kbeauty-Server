const mongoose = require('mongoose');
require('./db');
const Product = require('./models/ProductModel');

async function checkCategories() {
    try {
        const categories = await Product.distinct('category');
        console.log('Unique categories in database:', categories);
        
        const makeupCount = await Product.countDocuments({ category: 'Makeup' });
        console.log('Makeup products count:', makeupCount);
        
        const skincareCount = await Product.countDocuments({ category: 'Skincare' });
        console.log('Skincare products count:', skincareCount);
        
        const lowerSkincareCount = await Product.countDocuments({ category: 'skincare' });
        console.log('skincare (lowercase) products count:', lowerSkincareCount);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkCategories();
