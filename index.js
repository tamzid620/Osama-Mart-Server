require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 7000;


const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;


// const uri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.qtemx5j.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`
const uri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.qtemx5j.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0 ` 

const client = new MongoClient(uri);

let toysCollection;

client.connect()
  .then(() => {
    const db = client.db(osamaMart);
    toysCollection = db.collection('alltoys');
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


app.get('/all-toys', (req, res) => {
  toysCollection.find().toArray()
    .then((data) => res.json(data))
    .catch((error) => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch chef data' });
    });
});

app.get('/', (req, res) => {
  res.send('Express js connect successfully!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});