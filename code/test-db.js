const sql = require('mssql');

const dbConfig = {
  user: 'lemonjellyadmin',
  password: '$$$$$$$',
  server: 'lemonjelly-server.database.windows.net',
  database: 'free-sql-db-3254510',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function testConnection() {
  try {
    console.log('Connecting to database...');
    await sql.connect(dbConfig);
    console.log('SUCCESS: Connected to Azure SQL Database!');

    // Check if tables exist
    const tables = await sql.query("SELECT name FROM sys.tables");
    console.log('Tables found:', tables.recordset);

    if (tables.recordset.length === 0) {
      console.log('No tables found. Creating them now...');

      await sql.query(`CREATE TABLE menu_items (id INT PRIMARY KEY IDENTITY(1,1), name NVARCHAR(100) NOT NULL, price DECIMAL(5,2) NOT NULL, category NVARCHAR(50) NOT NULL)`);
      console.log('Created menu_items table');

      await sql.query(`CREATE TABLE orders (id INT PRIMARY KEY IDENTITY(1,1), customer_name NVARCHAR(100) NOT NULL, item_id INT NOT NULL, notes NVARCHAR(255), order_date DATETIME DEFAULT GETDATE(), status NVARCHAR(20) DEFAULT 'Pending')`);
      console.log('Created orders table');

      await sql.query(`CREATE TABLE staff (id INT PRIMARY KEY IDENTITY(1,1), name NVARCHAR(100) NOT NULL, role NVARCHAR(50) NOT NULL, schedule NVARCHAR(100) NOT NULL)`);
      console.log('Created staff table');

      await sql.query(`INSERT INTO menu_items (name, price, category) VALUES ('Full Irish Breakfast', 14.95, 'Breakfast'), ('Eggs Benedict', 13.50, 'Breakfast'), ('French Toast', 12.50, 'Breakfast'), ('Avocado Toast', 12.00, 'Brunch'), ('Savoury Crepe', 11.50, 'Brunch'), ('Acai Bowl', 11.00, 'Brunch'), ('Chicken Ciabatta', 10.95, 'Lunch'), ('Caesar Salad', 10.50, 'Lunch'), ('Flat White', 3.80, 'Coffee'), ('Americano', 3.50, 'Coffee')`);
      console.log('Inserted menu data');

      await sql.query(`INSERT INTO staff (name, role, schedule) VALUES ('Pascal', 'Senior Barista', 'Mon-Fri 7am-3pm'), ('Shane', 'Floor Manager', 'Mon-Sat 8am-4pm'), ('Edoardo', 'Chef', 'Tue-Sun 6am-2pm'), ('Sarah', 'Part-time Server', 'Sat-Sun 9am-5pm')`);
      console.log('Inserted staff data');

      console.log('ALL TABLES CREATED AND DATA INSERTED!');
    }

    const menu = await sql.query('SELECT * FROM menu_items');
    console.log('Menu items:', menu.recordset);

    await sql.close();
    console.log('DONE! Database is ready.');
  } catch (err) {
    console.log('FAILED:', err.message);
  }
}

testConnection();
