const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB is connected');

    // Mongoose connection events for granular debugging
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', function() {
      console.log('MongoDB connection successful');
    });

  } catch (err) {
    console.error('Failed to connect to MongoDB. Please check your configurations.');
  }
};

module.exports = connectDB;
