const mongoose = require("mongoose");

const commandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
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
  prix_total_ht: {
    type: Number,
    required: true,
  },
  tva_totale: {
    type: Number,
    required: true,
  },
  total_ttc: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["en attente", "préparation", "expédiée", "livrée", "annulée"],
    default: "en attente",
  },

  orderDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Command", commandSchema);
