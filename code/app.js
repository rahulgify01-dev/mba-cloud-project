const express = require('express');
const sql = require('mssql');
const app = express();
const port = 3000;

const dbConfig = {
  user: 'lemonjellyadmin',
  password: '$$$$$$$$',
  server: 'lemonjelly-server.database.windows.net',
  database: 'free-sql-db-3254510',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

sql.connect(dbConfig).then(() => {
  console.log('Connected to Azure SQL Database');
}).catch(err => {
  console.log('Database connection failed:', err);
});

app.use(express.json());

app.get('/api/menu', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM menu_items');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/staff', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM staff');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/order', async (req, res) => {
  try {
    const { customer_name, item_id, notes } = req.body;
    await sql.query`INSERT INTO orders (customer_name, item_id, notes) VALUES (${customer_name}, ${item_id}, ${notes})`;
    res.json({ success: true, message: 'Order placed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await sql.query('SELECT o.id, o.customer_name, m.name as item_name, m.price, o.notes, o.order_date, o.status FROM orders o JOIN menu_items m ON o.item_id = m.id ORDER BY o.order_date DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lemon Jelly Cafe - Dublin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Georgia, serif; background: #fefaf3; color: #333; }
        header { background: #f5c518; padding: 30px; text-align: center; }
        header h1 { font-size: 2.5em; color: #333; }
        header p { font-size: 1.1em; color: #555; margin-top: 5px; }
        .info-bar { background: #333; color: #fff; text-align: center; padding: 10px; font-size: 0.9em; }
        .section { max-width: 900px; margin: 30px auto; padding: 0 20px; }
        .section h2 { font-size: 1.8em; color: #333; border-bottom: 2px solid #f5c518; padding-bottom: 10px; margin-bottom: 20px; }
        .category { margin-bottom: 30px; }
        .category h3 { font-size: 1.3em; color: #f5a518; margin-bottom: 15px; }
        .menu-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #ddd; }
        .item-price { font-weight: bold; }
        .order-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 1em; }
        .btn { background: #f5c518; border: none; padding: 12px 30px; font-size: 1.1em; cursor: pointer; border-radius: 5px; font-weight: bold; }
        .btn:hover { background: #e0b015; }
        .card { background: #fff; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 1px 5px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
        .status-bar { max-width: 900px; margin: 10px auto; padding: 10px 20px; background: #e8f5e9; border-radius: 5px; text-align: center; font-size: 0.9em; }
        footer { background: #333; color: #fff; text-align: center; padding: 20px; margin-top: 40px; }
    </style>
</head>
<body>
    <header>
        <h1>Lemon Jelly Cafe</h1>
        <p>Millennium Walkway, Dublin 1 | Fresh Irish Meals Since Day One</p>
    </header>
    <div class="info-bar">Open 7 Days | Mon-Fri 7am-5pm | Sat-Sun 7am-7pm | +353 1 873 5161</div>
    <div class="status-bar">Cloud: Azure VM + Docker Container + <strong style="color:green;">Azure SQL Database Connected</strong> | B9MG210 Demo</div>
    <div class="section"><h2>Our Menu</h2><div id="menu">Loading menu from Azure SQL Database...</div></div>
    <div class="section"><h2>Place an Order</h2>
        <div class="order-form">
            <div class="form-group"><label>Your Name</label><input type="text" id="name" placeholder="Enter your name"></div>
            <div class="form-group"><label>Select Item</label><select id="item-select"></select></div>
            <div class="form-group"><label>Special Requests</label><textarea id="notes" rows="3" placeholder="Any special requests..."></textarea></div>
            <button class="btn" onclick="placeOrder()">Place Order</button>
            <p id="order-status" style="margin-top:15px;color:green;"></p>
        </div>
    </div>
    <div class="section"><h2>Recent Orders</h2><div id="orders">Loading orders...</div></div>
    <div class="section"><h2>Staff Schedule</h2><div id="staff">Loading staff...</div></div>
    <footer><p>Lemon Jelly Cafe | Millennium Walkway, Dublin 1, D01 Y027</p><p>Cloud Strategy Demo - B9MG210 | Azure VM + Docker + Azure SQL Database</p></footer>
    <script>
        fetch('/api/menu').then(r=>r.json()).then(items=>{
            const cats={};
            items.forEach(i=>{if(!cats[i.category])cats[i.category]=[];cats[i.category].push(i);});
            let h='';
            for(const[c,ci]of Object.entries(cats)){h+='<div class="category"><h3>'+c+'</h3>';ci.forEach(i=>{h+='<div class="menu-item"><span>'+i.name+'</span><span class="item-price">EUR '+i.price.toFixed(2)+'</span></div>';});h+='</div>';}
            document.getElementById('menu').innerHTML=h;
            const s=document.getElementById('item-select');
            items.forEach(i=>{s.innerHTML+='<option value="'+i.id+'">'+i.name+' - EUR '+i.price.toFixed(2)+'</option>';});
        }).catch(()=>{document.getElementById('menu').innerHTML='Failed to load menu';});

        function loadOrders(){
            fetch('/api/orders').then(r=>r.json()).then(orders=>{
                if(orders.length===0){document.getElementById('orders').innerHTML='<p>No orders yet</p>';return;}
                let h='';orders.forEach(o=>{h+='<div class="card"><div><strong>'+o.customer_name+'</strong> ordered '+o.item_name+(o.notes?' ('+o.notes+')':'')+'</div><div>EUR '+o.price.toFixed(2)+' | '+o.status+'</div></div>';});
                document.getElementById('orders').innerHTML=h;
            }).catch(()=>{document.getElementById('orders').innerHTML='Failed to load orders';});
        }
        loadOrders();

        fetch('/api/staff').then(r=>r.json()).then(staff=>{
            let h='';staff.forEach(s=>{h+='<div class="card"><strong>'+s.name+'</strong> - '+s.role+' | '+s.schedule+'</div>';});
            document.getElementById('staff').innerHTML=h;
        }).catch(()=>{document.getElementById('staff').innerHTML='Failed to load staff';});

        function placeOrder(){
            const n=document.getElementById('name').value;
            const i=document.getElementById('item-select').value;
            const no=document.getElementById('notes').value;
            if(!n){alert('Please enter your name');return;}
            fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer_name:n,item_id:parseInt(i),notes:no})})
            .then(r=>r.json()).then(()=>{document.getElementById('order-status').textContent='Order placed!';document.getElementById('name').value='';document.getElementById('notes').value='';loadOrders();})
            .catch(()=>{document.getElementById('order-status').textContent='Failed to place order';});
        }
    </script>
</body>
</html>`);
});

app.listen(port, '0.0.0.0', () => {
  console.log('Lemon Jelly Cafe running on port ' + port);
});
