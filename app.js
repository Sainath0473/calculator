const express = require('express');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars'); // Updated import
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/datingapp');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

const Profile = mongoose.model('Profile', {
  name: String,
  age: Number,
  interests: [String],
  bio: String,
  image: String
});

// Updated engine initialization
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  const profiles = await Profile.find();
  res.render('home', { title: 'Dating App', profiles });
});

app.get('/profile/new', (req, res) => {
  res.render('new-profile', { title: 'Create New Profile' });
});

app.post('/profile/new', upload.single('image'), async (req, res) => {
  const { name, age, interests, bio } = req.body;
  const image = req.file ? '/uploads/' + req.file.filename : null;
  const profile = new Profile({ name, age, interests: interests.split(','), bio, image });
  await profile.save();
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
