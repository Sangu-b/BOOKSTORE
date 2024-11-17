const path = require("path");
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const staticPath = path.join(__dirname, "public");

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Serve static files
app.use(express.static(staticPath));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "indexLogin.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "indexSignup.html"));
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  
  const emailPattern = /^eng\d{2}cs\d{4}@dsu\.edu\.in$/;
  if (!emailPattern.test(email)) {
    return res.status(400).send("Invalid email format. Please use 'eng00xx0000@edu.dsu.in' pattern.");
  }

  const user = new User({ email, password });
  user.save()
    .then(() => res.redirect("/indexRegistrationSuccessful.html"))
    .catch(err => res.status(500).send("Error registering user: " + err.message));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email, password })
    .then(user => {
      if (user) {
        res.json({ success: true }); 
      } else {
        res.json({ success: false }); 
      }
    })
    .catch(err => res.status(500).send("Error logging in: " + err.message));
});

app.get("/download/:file", (req, res) => {
  const file = req.params.file;
  const filePath = path.join(__dirname, "public", file);
  res.download(filePath);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
