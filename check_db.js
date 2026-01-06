const { promisePool } = require('./config/database');
async function run() {
    try {
        console.log('--- TESTING SERVER QUERIES ---');

        // 1. Stats
        const [stats] = await promisePool.query(`
          SELECT 
            COALESCE(SUM(total_amount), 0) as total_omset,
            COUNT(*) as total_transaksi,
            COALESCE(AVG(total_amount), 0) as rerata_pesanan
          FROM orders 
          WHERE DATE(created_at) = CURRENT_DATE()
        `);
        console.log('1. Stats:', stats[0]);

        // 2. Top Product
        const [topProduct] = await promisePool.query(`
          SELECT p.name, SUM(oi.quantity) as total_sold
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN orders o ON oi.order_id = o.id
          WHERE DATE(o.created_at) = CURRENT_DATE()
          GROUP BY oi.product_id
          ORDER BY total_sold DESC
          LIMIT 1
        `);
        console.log('2. Top Product:', topProduct ? topProduct[0] || 'NONE' : 'NONE');

        // 3. Trend
        const [trend] = await promisePool.query(`
          SELECT 
            HOUR(created_at) as hour,
            SUM(total_amount) as sales
          FROM orders
          WHERE DATE(created_at) = CURRENT_DATE()
          GROUP BY HOUR(created_at)
          ORDER BY hour ASC
        `);
        console.log('3. Trend Count:', trend ? trend.length : 0);

        // 4. Top List
        const [topList] = await promisePool.query(`
          SELECT p.name, p.price, SUM(oi.quantity) as sales
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN orders o ON oi.order_id = o.id
          WHERE DATE(o.created_at) = CURRENT_DATE()
          GROUP BY oi.product_id
          ORDER BY sales DESC
          LIMIT 5
        `);
        console.log('4. Top List Count:', topList ? topList.length : 0);

    } catch (err) {
        console.error('ERROR IN QUERIES:', err);
    }
    process.exit();
}
run();
