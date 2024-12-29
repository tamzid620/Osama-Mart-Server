const dotenv = require('dotenv');
const express = require('express');
const { MongoClient } = require('mongodb'); 
const cors = require('cors');
// const multer = require('multer');
const path = require('path');

dotenv.config();
const app = express();
const port = 7000;

const corsOptions = {
  origin: ['http://localhost:3000'] ,
  optionsSuccessStatus: 200,
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const dbUsername = process.env.DB_USERNAME || 'defaultUsername';
const dbPassword = process.env.DB_PASSWORD || 'defaultPassword';
const dbName = process.env.DB_NAME || 'defaultDBName';

const uri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.qtemx5j.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

let allToysCollection;
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
// ---------------------------------------- Api section  ----------------------------------------------------------
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

// --------------------------------------------------------------------------------------------------------------

app.put('/all-toys/:id', (req, res) => {
  const toyId = parseInt(req.params.id); 
  const updatedData = req.body; 

  if (!toyId || typeof toyId !== 'number') {
    return res.status(400).json({ message: 'Invalid toy ID' });
  }

  delete updatedData._id;

  if (!updatedData || Object.keys(updatedData).length === 0) {
    return res.status(400).json({ message: 'No data provided for update' });
  }

  allToysCollection
    .updateOne(
      { id: toyId }, 
      { $set: updatedData } 
    )
    .then((result) => {
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Toy not found' });
      }
      res.json({ message: 'Toy updated successfully', result });
    })
    .catch((error) => {
      console.error('Error updating toy:', error);
      res.status(500).json({ message: 'Error updating toy', error });
    });
});



// --------------------------------------------------------------------------------------------------------------

//////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Express js connect successfully!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});