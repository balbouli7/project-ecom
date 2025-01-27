const mongoose = require("mongoose");

const commandSchema = new mongoose.Schema({
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "produit",
        required: true,
      },
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
      category: { type: String, required: [true, "category is required"] },
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  prix_total_ht: {
    type: Number,
    required: true,
    default: 0,
  },
  tva_totale: {
    type: Number,
    required: true,
    default: 0,
  },
  total_ttc: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ["en attente", "préparation", "expédiée", "livrée", "annulée"],
    default: "en attente",
  },
  orderDate: { type: Date, default: Date.now },
});

commandSchema.pre("save", function (next) {
  const command = this;
  let totalHT = 0;

  command.products.forEach((product) => {
    totalHT += product.quantite * product.prix_unitaire_ht;
  });

  command.prix_total_ht = totalHT;
  command.tva_totale = totalHT * 0.2; // Assuming a 20% VAT rate
  command.total_ttc = totalHT + command.tva_totale;

  next();
});

module.exports = mongoose.model("Command", commandSchema);
