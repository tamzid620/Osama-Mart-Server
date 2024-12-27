const dotenv = require('dotenv');
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const multer = require('multer');
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

// Setup multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where the files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with extension
  },
});
const upload = multer({ storage: storage });

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

// --------------------------------------------------------------------------------------------------------------
app.post('/update-toys/', upload.fields([
  { name: 'image', maxCount: 1 }, 
  { name: 'hoverImage', maxCount: 1 }
]), (req, res) => {
  const { id, name, price, quantity, category, rating, description } = req.body;
  const image = req.files['image'] ? req.files['image'][0].filename : null;
  const hoverImage = req.files['hoverImage'] ? req.files['hoverImage'][0].filename : null;

  const toyData = {
    name,
    price,
    quantity,
    category,
    rating,
    description,
    image: image,
    hoverImage: hoverImage,
  };

  // Update the toy in the database by its ID
  allToysCollection.updateOne(
    { _id: new MongoClient.ObjectId(id) }, // Use MongoDB ObjectId for matching
    { $set: toyData }
  )
    .then((result) => {
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'Toy updated successfully!' });
      } else {
        res.status(404).json({ message: 'Toy not found or no changes made' });
      }
    })
    .catch((error) => {
      console.error('Error updating toy:', error);
      res.status(500).json({ message: 'Error updating toy' });
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