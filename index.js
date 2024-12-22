const dotenv = require('dotenv');
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

dotenv.config();
const app = express();
const port = 7000;

const corsOptions = {
  origin: ['http://localhost:3000','https://osama-mart-server.vercel.app/' ] ,// Frontend URL
  optionsSuccessStatus: 200,
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true, // Allow cookies or authorization headers if needed
};
app.use(cors(corsOptions));

const dbUsername = process.env.DB_USERNAME || 'defaultUsername';
const dbPassword = process.env.DB_PASSWORD || 'defaultPassword';
const dbName = process.env.DB_NAME || 'defaultDBName';

const uri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.qtemx5j.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

let toysCollection;
////////////////////////////////////////////////
client.connect()
  .then(() => {
    const db = client.db(dbName);
    allToysCollection = db.collection('alltoys');
    specialGalleryCollection = db.collection('specialGallary');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
// -------------------------------------------
app.get('/all-toys', (req, res) => {
  allToysCollection.find().toArray()
    .then((data) => res.json(data))
    .catch((error) => {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Error fetching data' });
    });
});
app.get('/special-gallery', (req, res) => {
  specialGalleryCollection.find().toArray()
    .then((data) => res.json(data))
    .catch((error) => {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Error fetching data' });
    });
});

app.get('/all-toys/:id', (req, res) => {
  const toyId = req.params.id;
  allToysCollection.findOne({ id: parseInt(toyId) }) 
      .then((toy) => {
      if (toy) {
        res.json(toy);
      } else {
        res.status(404).json({ message: 'Toy not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching toy:', error);
      res.status(500).json({ message: 'Error fetching toy' });
    });
});


//////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Express js connect successfully!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});