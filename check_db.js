const { promisePool } = require('./config/database');

async function checkProducts() {
    try {
        const [rows] = await promisePool.execute('SELECT * FROM products');
        console.log('Total products:', rows.length);
        if (rows.length > 0) {
            console.log('Sample product:', rows[0]);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkProducts();
