const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const routerBook = require('./routes/book.route');
const routemybooks = require('./routes/mybooks.route');
const flash = require('connect-flash');
const multer = require('multer'); // Pour gérer les uploads
const { fromPath } = require("pdf2pic"); // Pour convertir le PDF en image
const fs = require('fs'); // Gestion des fichiers
const cors = require('cors');
const path = require('path'); // Ajout du module path
const Store = require('connect-mongo'); // Si tu utilises MongoDB pour stocker la session
const mongoose = require('mongoose');
const Book = require('./models/book.models'); // Assure-toi que ton modèle Book est importé

dotenv.config();
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3000;

connectDB();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.Mongo_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Configuration de la session avec MongoDB comme store
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    store: Store.create({
        mongoUrl: process.env.Mongo_URI, // Passe la chaîne de connexion MongoDB ici
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true }
    }),
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'assets')));

app.use(flash());

// Routes
app.use('/books', routerBook);
app.use('/mybooks', routemybooks);

// Route pour le tableau de bord
app.get('/images/:filename', async (req, res) => {
    const filePath = path.join(__dirname, 'assets/images', req.params.filename);
    console.log("Filename received:", req.params.filename); // Log du nom du fichier reçu

    try {
        // Log avant la recherche dans la base de données
        console.log("Searching for book in database...");
        const book = await Book.findOne({ livre: `images/${req.params.filename}` });
        console.log("Book found:", book); // Log du livre trouvé

        if (!book) {
            console.log("Livre non trouvé dans la base de données.");
            return res.status(404).send("Livre non trouvé");
        }

        // Incrémenter le compteur
        book.downloads += 1;
        const updatedBook = await book.save();
        console.log("Downloads updated:", updatedBook.downloads); // Affiche le nombre de téléchargements après la sauvegarde

        // Envoie le fichier
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error("File not found:", err);
                return res.status(404).send("File not found");
            }

            res.download(filePath, (err) => {
                if (err) {
                    console.error("Error sending file:", err);
                    return res.status(500).send("Could not download file");
                }
            });
        });
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).send("Erreur serveur");
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use('/api', userRoutes);
