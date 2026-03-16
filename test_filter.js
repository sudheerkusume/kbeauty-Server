const axios = require('axios');

async function testFiltering() {
    const baseUrl = 'http://localhost:5000/products';
    
    try {
        console.log('--- Testing Category Filtering: Makeup ---');
        const resMakeup = await axios.get(`${baseUrl}?category=Makeup`);
        console.log(`Found ${resMakeup.data.length} makeup products.`);
        resMakeup.data.forEach(p => console.log(`- ${p.title} (${p.category})`));

        console.log('\n--- Testing Bestseller Filtering ---');
        const resBestseller = await axios.get(`${baseUrl}?bestseller=true`);
        console.log(`Found ${resBestseller.data.length} bestseller products.`);
        resBestseller.data.forEach(p => console.log(`- ${p.title} (Bestseller: ${p.bestseller})`));

    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

testFiltering();
