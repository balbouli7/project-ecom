const express = require('express');
const { createProduct,getProduct , updatProduit , deleteProduit} = require('../controllers/productController'); // Assurez-vous que cette importation est correcte
const router = express.Router();

// Route pour créer un produit
router.post('/createProduct', createProduct);
//affichier
router.get('/getProduct', getProduct);
//mise a jour
router.put("/updatProduit/:id", updatProduit);
//supprime
router.delete("/deleteProduit/:id", deleteProduit);
module.exports = router;
