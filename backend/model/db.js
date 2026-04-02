import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Initial Connection Successful');
  } catch (err) {
    console.error('Initial Connection Error:', err.message);
    process.exit(1);
  }
};

// Listen for events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

export default connectDB;