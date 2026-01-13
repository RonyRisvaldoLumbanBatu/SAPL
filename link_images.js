const { promisePool } = require('./config/database');

const mappings = [
  { file: "Air Mineral.jpg", name: "Air Mineral" },
  { file: "Ati Ampela Penyet.jpg", name: "Ati Ampela Penyet" },
  { file: "Ayam Bakar Madu.png", name: "Ayam Bakar Madu" },
  { file: "Ayam Penyet Dada.jpeg", name: "Ayam Penyet Dada" },
  { file: "Ayam Penyet Paha.jpeg", name: "Ayam Penyet Paha" },
  { file: "Bebek Goreng Surabaya.jpg", name: "Bebek Goreng" },
  { file: "Es Jeruk Peras.jpeg", name: "Es Jeruk" },
  { file: "Es Teh Manis.jpg", name: "Es Teh Manis" },
  { file: "Jeruk Hangat.jpeg", name: "Jeruk Hangat" },
  { file: "Kerupuk Putih.jpeg", name: "Kerupuk" },
  { file: "Lele Goreng Crispy.jpg", name: "Lele Goreng" },
  { file: "Nasi Putih.jpeg", name: "Nasi Putih" },
  { file: "Pete Goreng.jpg", name: "Pete Goreng" },
  { file: "Sambal Ijo (Extra).jpg", name: "Sambal Ijo" },
  { file: "Sambal Terasi (Extra).jpg", name: "Sambal Terasi" },
  { file: "Tahu Tempe Penyet.jpg", name: "Tahu Tempe" },
  { file: "Teh Hangat.avif", name: "Teh Hangat" }
];

async function run() {
    try {
        console.log("=== Fixing Database & Linking Images ===");

        // 1. Add 'image' column if missing
        try {
            await promisePool.execute("ALTER TABLE products ADD COLUMN image VARCHAR(255) DEFAULT NULL");
            console.log("Successfully added 'image' column to products table.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("'image' column already exists.");
            } else {
                console.error("Error adding column:", err);
            }
        }

        // 2. Update records
        for (const m of mappings) {
            const [res] = await promisePool.execute(
                `UPDATE products SET image = ? WHERE name LIKE ?`,
                [m.file, `%${m.name}%`]
            );
            if (res.affectedRows > 0) {
                 console.log(`Matched '${m.name}' -> Set image to '${m.file}'`);
            }
        }
        console.log("Done!");
    } catch (e) {
        console.error("Script failed:", e);
    } finally {
        process.exit();
    }
}

run();
