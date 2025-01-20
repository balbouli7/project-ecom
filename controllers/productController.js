const Product = require('../models/Product');

// Créer un produit
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les produits
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.find();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//mise a jour
exports.updatProduit = async (req, res) => {
  try {
    // pour test portmen
    const updatProduit = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(updatProduit);
  } catch (error) {
    //400 haja n9sa le tajile
    res.status(500).json({ "erreur: ": error.message });
  }
};
//supprime
exports.deleteProduit = async (req, res) => {
  try {
    // pour test portmen
    const deleteProduit = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "students deleted successfully" });
  } catch (error) {
    //500 haja n9sa le tajile
    res.status(500).json({ "erreur: ": error.message });
  }
};