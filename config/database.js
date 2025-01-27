const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config(); // Charger les variables d'environnement

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("Mongo URI is not defined.");
    }
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Arrêter le processus si la connexion échoue
  }
};

module.exports = connectDB;
