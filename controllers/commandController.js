const mongoose = require("mongoose");
const Command = require("../models/command");
const Product = require("../models/Product");

//ajouter
exports.createCommand = async (req, res) => {
  try {
    const { name, productId, quantity, tvaRate } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé." });
    }

    const prix_unitaire_ht = product.prix_unitaire_ht;
    const prix_total_ht = prix_unitaire_ht * quantity;
    const tva_totale = prix_total_ht * (tvaRate / 100);
    const total_ttc = prix_total_ht + tva_totale;

    const newCommand = await Command.create({
      name,
      productId,
      quantite: quantity,
      prix_unitaire_ht: prix_unitaire_ht,
      prix_total_ht,
      tva_totale,
      total_ttc,
    });

    res.status(201).json(newCommand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//affichier
exports.getCommands = async (req, res) => {
  try {
    const commands = await Command.find().populate("productId");
    res.status(200).json(commands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//modifier
//mise a jour
// Sanitize and validate the ObjectId
exports.updateCommand = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim(); // Nettoyer l'ID pour éviter les erreurs dues aux espaces ou retours à la ligne

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide." });
    }

    // Rechercher la commande
    const command = await Command.findById(id);
    if (!command) {
      return res.status(404).json({ error: "Commande non trouvée." });
    }

    // Mettre à jour les données de la commande
    const { name, productId, quantity, tvaRate, status } = req.body;

    if (name) command.name = name;
    if (quantity) command.quantity = quantity;
    if (status) command.status = status;

    // Si le productId est mis à jour, recalculer les totaux
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Produit non trouvé." });
      }

      const prix_total_ht = quantity * product.price;
      const tva_totale = prix_total_ht * (tvaRate / 100);
      const total_ttc = prix_total_ht + tva_totale;

      command.productId = productId;
      command.unitPriceHT = product.price;
      command.totalPriceHT = prix_total_ht;
      command.totalTVA = tva_totale;
      command.totalTTC = total_ttc;
    }

    // Enregistrer les modifications
    await command.save();
    res.status(200).json(command);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//supprime

exports.deleteCommand = async (req, res) => {
  try {
    // Nettoyer l'ID pour supprimer les espaces ou caractères inutiles
    const id = req.params.id.trim();

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ error: "ID invalide. Veuillez fournir un ID valide." });
    }

    // Vérifier si la commande existe
    const command = await Command.findById(id);
    if (!command) {
      return res.status(404).json({ error: "Commande non trouvée." });
    }

    // Supprimer la commande
    await Command.findByIdAndDelete(id);
    res.status(200).json({ message: "Commande supprimée avec succès." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur serveur. Veuillez réessayer plus tard." });
  }
};
