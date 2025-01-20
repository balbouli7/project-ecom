const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, "name is required"] },
  description: { type: String },
  quantite: {
    type: Number,
    required: [true, "quantite is required"],
    min: [0, "quantite must be at least 0"],
  },
  prix_unitaire_ht: {
    type: Number,
    required: [true, "prix_unitaire_ht is required"],
    min: [0, "prix_unitaire_ht must be at least 0"],
  },
  image: { type: String },
  category: { type: String, required: true },
});

module.exports = mongoose.model("Product", productSchema);
