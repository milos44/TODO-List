const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');

var mariadb = require('mariadb');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/assets/jquery', express.static(__dirname+ '/node_modules/jquery/dist/'));
app.use('/assets/datatables/js', express.static(__dirname+ '/node_modules/datatables.net/js/'));
app.use('/assets/datatables/css', express.static(__dirname + '/node_modules/datatables.net-dt/css/'));
app.use('/assets/datatables/images', express.static(__dirname + '/node_modules/datatables.net-dt/images/'));
app.use('/assets/datatables/js', express.static(__dirname + '/node_modules/datatables.net-dt/js/'));

const pool = mariadb.createPool({
    host: 'localhost', 
     user:'root', 
     password: 'Test%123',
     database: "todolist"
  }); 

//this route is called when we type in browser localhost:3000
router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

//this route is called when we type in browser localhost:3000/list/1
router.get('/list/:id',function(req,res){
   res.sendFile(path.join(__dirname+'/items.html'));
}); 

// rest api post used to fill main datatable with all lists  
app.post('/list', async function (req, res) {
    let conn;
    try {
        conn = await pool.getConnection();
        const data = await conn.query("SELECT * FROM todolists");        
        //console.log( data );
        res.end( JSON.stringify(data));
     } catch (err) {
         throw err;
     } finally {
        if (conn) 
             return conn.end();
     } 
});
// rest api post used to fill main datatable with all items localhost:3000/items/1
app.post('/items/:listId', async function (req, res) {
    let conn;
    console.log("uso 1.");
    try {
        conn = await pool.getConnection();
        const data = await conn.query("SELECT t.name as listname, i.* FROM items i JOIN todolists t ON t.id = i.listId WHERE i.listId = (?)",[req.params.listId]);        
        console.log( data );
        var result = JSON.stringify(data);
        console.log("uso 2.");
        if (data.length > 0){
            res.end(result);
        }
        else{
            console.log("uso 3.");
            var list = await conn.query("SELECT name as listname, 0 as Id, 0 as listId, '' as name  FROM todolists  WHERE id = (?)",[req.params.listId]);
            //console.log("list: "+list);
            res.end(JSON.stringify(list));
        }
     } catch (err) {
         throw err;
     } finally {
        if (conn) 
             return conn.end();
     } 
});
//rest api get list by id localhost:3000/1
app.get('/:id', function (req, res) {
        var requestId = req.params.id;
        //console.log( requestId );
        res.end( JSON.stringify(requestId));
  }); 

//rest api add new list localhost:3000/add
app.post('/add', async function (req, res) {
      let conn;
      try {
          conn = await pool.getConnection();
          const data = await conn.query("INSERT INTO todolists (name, state) values (?,?)",[req.body.name,req.body.state]);        
          //console.log( data );
          res.end( JSON.stringify(data));
       } catch (err) {
           throw err;
       } finally {
          if (conn) 
               return conn.end();
       } 
}); 
//rest api add new item localhost:3000/item/add
app.post('/item/add', async function (req, res) {
    let conn;
    try {
        conn = await pool.getConnection();
        const data = await conn.query("INSERT INTO items (listId,name) values (?,?)",[req.body.listId, req.body.name]);        
        console.log( data );
        res.end( JSON.stringify(data));
     } catch (err) {
         throw err;
     } finally {
        if (conn) 
             return conn.end();
     } 
}); 
//rest api delete list by id localhost:3000/delete/1
app.delete('/delete/:id', async function (req, res) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("DELETE FROM items WHERE listid = (?)", req.params.id);
        const data = await conn.query("DELETE FROM todolists WHERE id = (?)", req.params.id);        
        console.log( data );
        res.end( JSON.stringify(data));
     } catch (err) {
         throw err;
     } finally {
        if (conn) 
             return conn.end();
     } 
}); 

//rest api delete items by id localhost:3000/delete/1
app.delete('/item/delete/:id', async function (req, res) {
    let conn;
    try {
        conn = await pool.getConnection();
        const data = await conn.query("DELETE FROM items WHERE id = (?)", req.params.id);   
        //console.log( data );
        res.end( JSON.stringify(data));
     } catch (err) {
         throw err;
     } finally {
        if (conn) 
             return conn.end();
     } 
}); 
//rest api for list update localhost:3000/update/1
app.put('/update/:id', async function (req, res) {
    console.log('put');
    let conn;
    try {
        conn = await pool.getConnection();
        const data = await conn.query("UPDATE todolists SET NAME = (?), state = (?) WHERE id = (?)",[req.body.name,req.body.state,req.params.id]);        
        //console.log( data );
        res.end( JSON.stringify(data));
     } catch (err) {
         throw err;
     } finally {
        if (conn) 
             return conn.end();
     } 
}); 
//rest api for items update localhost:3000/update/item/1
app.put('/item/update/:id', async function (req, res) {
    console.log('put');
    let conn;
    try {
        conn = await pool.getConnection();
        const data = await conn.query("UPDATE items SET NAME = (?) WHERE id = (?)",[req.body.name,req.params.id]);        
        //console.log( data );
        res.end( JSON.stringify(data));
     } catch (err) {
         throw err;
     } finally {
        if (conn) 
             return conn.end();
     } 
}); 
app.use('/',router);
app.listen(3000, () => {
    console.log("server is up and listening on 3000...")})