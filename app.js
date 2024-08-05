const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();

connectDB();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

app.set('view engine', 'ejs');

app.use('/', userRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
