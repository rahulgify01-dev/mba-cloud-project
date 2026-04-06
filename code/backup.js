const sql = require('mssql');
const { BlobServiceClient } = require('@azure/storage-blob');

const dbConfig = {
  user: 'lemonjellyadmin',
  password: 'LemonCafe@2026',
  server: 'lemonjelly-server.database.windows.net',
  database: 'free-sql-db-3254510',
  options: { encrypt: true, trustServerCertificate: false }
};

const STORAGE_CONNECTION = 'YOUR_AZURE_STORAGE_CONNECTION_STRING';

async function backup() {
  try {
    console.log('Connecting to database...');
    await sql.connect(dbConfig);
    console.log('Connected!');

    console.log('Fetching data...');
    const menu = await sql.query('SELECT * FROM menu_items');
    const orders = await sql.query('SELECT * FROM orders');
    const staff = await sql.query('SELECT * FROM staff');

    const backupData = JSON.stringify({
      timestamp: new Date().toISOString(),
      menu_items: menu.recordset,
      orders: orders.recordset,
      staff: staff.recordset
    }, null, 2);

    console.log('Uploading to Azure Blob Storage...');
    const blobClient = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION);
    const container = blobClient.getContainerClient('backups');
    const filename = 'backup-' + new Date().toISOString().slice(0,10) + '.json';
    const blob = container.getBlockBlobClient(filename);
    await blob.upload(backupData, backupData.length);

    console.log('SUCCESS! Backup saved as: ' + filename);
    await sql.close();
  } catch (err) {
    console.log('BACKUP FAILED:', err.message);
  }
}

backup();
