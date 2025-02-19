const dotenv = require('dotenv');
const express = require('express');
const { MongoClient } = require('mongodb'); 
const cors = require('cors');
// const multer = require('multer');
const path = require('path');
const { ObjectId } = require("mongodb");

dotenv.config();
const app = express();
const port = process.env.PORT || 7000;

const corsOptions = {
  origin: ['http://localhost:3000' , 'https://osama-mart.vercel.app'] ,
  optionsSuccessStatus: 200,
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const dbUsername = process.env.DB_USERNAME || osamaMart;
const dbPassword = process.env.DB_PASSWORD || YAmQHpjlXhPN6sON;
const dbName = process.env.DB_NAME || osamaMart;

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
// ---------------------------------------- Api section  start ----------------------------------------------------------
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

// get all toy-----------
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

// update all toy-----------

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


// Delete toy by id --------------

app.delete('/all-toys/:_id', async (req, res) => {
  try {
    const toyId = req.params._id;
    
    if (!ObjectId.isValid(toyId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const result = await allToysCollection.deleteOne({ _id: new ObjectId(toyId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Toy not found' });
    }

    res.json({ message: 'Toy deleted successfully' });
  } catch (error) {
    console.error('Error deleting toy:', error);
    res.status(500).json({ message: 'Error deleting toy', error });
  }
});


// Add all toy-----------

app.post('/all-toys', (req, res) => {
  const newToy = req.body;


  allToysCollection
    .insertOne(newToy)
    .then((result) => {
      res.status(201).json({ message: 'Toy added successfully', result });
    })
    .catch((error) => {
      console.error('Error adding toy:', error);
      res.status(500).json({ message: 'Error adding toy', error });
    });
});


// ------------------------------------------- Api section  end------------------------------------------------

//////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Express js connect successfully!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});