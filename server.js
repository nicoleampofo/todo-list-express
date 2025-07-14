// Express
const express = require('express');
const app = express();

const PORT = 1738;

// MongoDB
const { MongoClient } = require('mongodb');
// replace the database connection string with your own, including the new password
// ignore any deprecation warnings. All that matters is that the connection verification line shows in the console.
const connectionString = "mongodb+srv://admin/password@cluster1.dji4l0n.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
// Database
let db;
client.connect()
    .then(() => {
        db = client.db('todoApp');
        console.log("Connected to Database");
    })
    .catch(err => console.error(err));


app.set('view engine', 'ejs')
// holds static files
app.use(express.static('public'))
// leon explained it as formerly body parser. Looks at incoming requests and pull data from the requests. (get, delete, update)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/',async (request, response)=>{
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        // respond to the client that the item has been deleted
        response.json('Todo Deleted')
        // switch back to lok at main.js deleteItem function
    })
    .catch(error => console.error(error))

})

// this changes when it is pushed to Heroku
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})