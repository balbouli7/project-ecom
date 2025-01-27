const express = require('express');
const dotenv = require("dotenv");
const connectDB = require('./config/database'); // Assurez-vous que la connexion DB est établie
const productRoutes = require('./routes/productRoutes'); // Importez les routes produits
const commandRoutes = require('./routes/commandRoutes');
const userRoutes = require('./routes/userRoutes');
const livraisionRoutes = require('./routes/deliveryRoutes');
dotenv.config();
const app = express();
// Lancement du serveur
const PORT = process.env.PORT || 3000;
// Connexion à la base de données
connectDB();

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Utilisation des routes définies pour les produits
app.use('/api/products', productRoutes); // Cette ligne de code redirige /api/products vers productRoutes
app.use('/api/commands', commandRoutes); // Cette ligne de code redirige /api/commande vers commandRoutes
app.use('/api/user', userRoutes); // Cette ligne de code redirige /api/user vers userRoutes
app.use('/api/livraision', livraisionRoutes); // Cette ligne de code redirige /api/user vers livraisionRoutes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
