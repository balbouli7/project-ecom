const mongoose = require("mongoose");
const Command = require("../models/command");
const user = require("../models/user");
const Product = require("../models/Product");
//--------------------------
const PDFDocument = require("pdfkit");
const fs = require("fs");
//--------------------------
// ajouter
exports.createCommand = async (req, res) => {
  try {
    const { products, userId } = req.body;

    // Vérifier que les produits et l'userId sont présents
    if (!products || !userId) {
      return res.status(400).json({ error: "Tous les champs requis doivent être fournis." });
    }

    // Vérifier que les produits contiennent des informations valides
    if (products.length === 0) {
      return res.status(400).json({ error: "La commande doit contenir des produits." });
    }

    products.forEach(product => {
      if (!product.productId || !product.name || !product.quantite || !product.prix_unitaire_ht || !product.category) {
        return res.status(400).json({ error: "Tous les champs des produits doivent être fournis." });
      }
    });

    // Si tout est valide, procéder à la création de la commande...
    const newCommand = await Command.create({
      products,
      userId,
      // autres champs nécessaires...
    });

    res.status(201).json(newCommand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


//-----------------------------
//affichier tous
exports.getAllCommands = async (req, res) => {
  try {
   const commandes = await Command.find()
    res.status(200).json(commandes);  // Retourner les commandes trouvées
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
  }
};

//--------------------------------
//modifier qte

exports.updateCommand = async (req, res) => {
  const { id } = req.params; // ID de la commande à mettre à jour
  const { status, products } = req.body; // Champs à mettre à jour

  try {
    // Vérifiez si la commande existe
    const command = await Command.findById(id);
    if (!command) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    // Mettre à jour les détails de la commande (statut et/ou produits)
    if (status) {
      command.status = status;
    }

    if (products && Array.isArray(products)) {
      products.forEach((updatedProduct) => {
        const productIndex = command.products.findIndex(
          (p) => p.productId.toString() === updatedProduct.productId
        );

        if (productIndex !== -1) {
          // Mettre à jour les détails du produit existant
          command.products[productIndex].quantite =
            updatedProduct.quantite || command.products[productIndex].quantite;
          command.products[productIndex].prix_unitaire_ht =
            updatedProduct.prix_unitaire_ht || command.products[productIndex].prix_unitaire_ht;
          command.products[productIndex].description =
            updatedProduct.description || command.products[productIndex].description;
        } else {
          // Ajouter un nouveau produit si non trouvé
          command.products.push(updatedProduct);
        }
      });
    }

    // Recalculer les totaux
    let totalHT = 0;
    command.products.forEach((product) => {
      totalHT += product.quantite * product.prix_unitaire_ht;
    });

    command.prix_total_ht = totalHT;
    command.tva_totale = totalHT * 0.2; // Exemple avec un taux de TVA de 20%
    command.total_ttc = totalHT + command.tva_totale;

    // Sauvegarder la commande mise à jour
    const updatedCommand = await command.save();

    res.status(200).json(updatedCommand);
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

//----------------------------
//affiche id

exports.getCommandById = async (req, res) => {
  try {
    // Récupérer l'ID depuis les paramètres de l'URL
    const { id } = req.params;

    // Vérifier si l'ID est fourni
    if (!id) {
      return res.status(400).json({ error: "L'ID est requis." });
    }

    // Trouver la commande par son ID et peupler les produits et l'utilisateur
    const commande = await Command.findById(id)
      //.populate('products.productId')  // Peupler les produits
      //.populate('userId');  // Peupler l'utilisateur

    // Si la commande n'est pas trouvée
    if (!commande) {
      return res.status(404).json({ error: "Commande non trouvée." });
    }

    // Retourner la commande trouvée
    res.status(200).json(commande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur", details: error.message });
  }
};
//-------------------------
//affichie par date
exports.getCommandsByDate = async (req, res) => {
  try {
    // Récupérer la date depuis les paramètres de la requête (par exemple : YYYY-MM-DD)
    const { date } = req.query;

    // Vérifier si la date est fournie
    if (!date) {
      return res.status(400).json({ error: "La date est requise." });
    }

    // Convertir la date en objet Date
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // Pour inclure toute la journée (de 00:00 à 23:59)

    // Trouver les commandes avec la date correspondante
    const commandes = await Command.find({
      orderDate: { $gte: startDate, $lt: endDate },
    })
     

    // Si aucune commande n'est trouvée
    if (commandes.length === 0) {
      return res.status(404).json({ error: "Aucune commande trouvée pour cette date." });
    }

    // Retourner les commandes trouvées
    res.status(200).json(commandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur", details: error.message });
  }
};
//----------------------------
//afficgier par user
exports.getCommandsByUser = async (req, res) => {
  try {
    // Récupérer l'userId depuis les paramètres de la requête
    const { userId } = req.query;

    // Vérifier si l'userId est fourni
    if (!userId) {
      return res.status(400).json({ error: "L'userId est requis." });
    }

    // Trouver les commandes associées à l'userId
    const commandes = await Command.find({ userId: userId })
      

    // Si aucune commande n'est trouvée
    if (commandes.length === 0) {
      return res.status(404).json({ error: "Aucune commande trouvée pour cet utilisateur." });
    }

    // Retourner les commandes trouvées
    res.status(200).json(commandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur", details: error.message });
  }
};
//--------------------
//supprime par produit 
exports.deleteProductFromCommand = async (req, res) => {
  try {
    const { commandId, productId } = req.params;

    // Trouver la commande par son ID
    const command = await Command.findById(commandId);

    // Vérifier si la commande existe
    if (!command) {
      return res.status(404).json({ error: "Commande non trouvée." });
    }

    // Trouver le produit à supprimer dans le tableau des produits
    const productIndex = command.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: "Produit non trouvé dans cette commande." });
    }

    // Supprimer le produit du tableau
    command.products.splice(productIndex, 1);

    // Recalculer les prix après suppression du produit
    let totalHT = 0;
    command.products.forEach((product) => {
      totalHT += product.quantite * product.prix_unitaire_ht;
    });

    command.prix_total_ht = totalHT;
    command.tva_totale = totalHT * 0.2; // Taux de TVA de 20%
    command.total_ttc = totalHT + command.tva_totale;

    // Sauvegarder la commande mise à jour
    await command.save();

    // Retourner la commande mise à jour
    res.status(200).json(command);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur", details: error.message });
  }
};
//-----------------------
//modifier par id
exports.updateProductInCommand = async (req, res) => {
  try {
    const { commandId, productId } = req.params;
    const { name, description, quantite, prix_unitaire_ht, image, category } = req.body;

    // Trouver la commande par son ID
    const command = await Command.findById(commandId);

    // Vérifier si la commande existe
    if (!command) {
      return res.status(404).json({ error: "Commande non trouvée." });
    }

    // Trouver le produit dans la commande par son ID
    const productIndex = command.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    // Vérifier si le produit existe
    if (productIndex === -1) {
      return res.status(404).json({ error: "Produit non trouvé dans cette commande." });
    }

    // Mettre à jour les informations du produit
    command.products[productIndex].name = name || command.products[productIndex].name;
    command.products[productIndex].description = description || command.products[productIndex].description;
    command.products[productIndex].quantite = quantite || command.products[productIndex].quantite;
    command.products[productIndex].prix_unitaire_ht = prix_unitaire_ht || command.products[productIndex].prix_unitaire_ht;
    command.products[productIndex].image = image || command.products[productIndex].image;
    command.products[productIndex].category = category || command.products[productIndex].category;

    // Recalculer les prix après mise à jour
    let totalHT = 0;
    command.products.forEach((product) => {
      totalHT += product.quantite * product.prix_unitaire_ht;
    });

    command.prix_total_ht = totalHT;
    command.tva_totale = totalHT * 0.2; // Taux de TVA de 20%
    command.total_ttc = totalHT + command.tva_totale;

    // Sauvegarder la commande mise à jour
    await command.save();

    // Retourner la commande mise à jour
    res.status(200).json(command);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur", details: error.message });
  }
};

//-----------------------------
//pdf

exports.generateCommandPDF = async (req, res) => {
  try {
    // Récupérer toutes les commandes avec les informations des produits
    const commands = await Command.find()
      .populate({
        path: 'product.productId', // Assurez-vous que vous utilisez le bon champ pour la relation
        select: 'name prix_unitaire_ht', // Sélection des champs du produit
        strictPopulate: false // Permet de contourner la vérification stricte
      });

    if (!commands || commands.length === 0) {
      return res.status(404).json({ message: 'Aucune commande trouvée.' });
    }

    // Créer un document PDF
    const doc = new PDFDocument();
    const pdfPath = "Liste_Commandes.pdf";
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Titre du PDF
    doc.fontSize(20).text("Liste des Commandes", { align: "center" }).moveDown();

    // Boucle pour parcourir toutes les commandes
    commands.forEach((command, index) => {
      doc.fontSize(14).text(`Commande ${index + 1}`, { underline: true }).moveDown(0.5);
    
      doc.text(`Nom de la commande: ${command.name || "Nom inconnu"}`);
      doc.text(`Date de commande: ${command.orderDate ? new Date(command.orderDate).toLocaleString() : "Date inconnue"}`);
      doc.text(`Statut: ${command.status || "Statut inconnu"}`);
      doc.text("Produits:");
console.log("-------------------------------")
console.log(command.products)
console.log("-------------------------------")

      // Vérification de la présence de produits et affichage détaillé
      if (command.products && command.products.length > 0) {
        command.products.forEach((prod) => {
          if (!prod.productId) {
            doc.text("Produit non trouvé pour l'ID donné.");
          } else {
            doc.text(` - Produit: ${prod.name || "Nom inconnu"}`);
            doc.text(`   Quantité: ${prod.quantite || 0}`);
            doc.text(`   Prix unitaire HT: ${prod.prix_unitaire_ht ? prod.prix_unitaire_ht.toFixed(2) : "N/A"} €`);
          }
        });
      } else {
        doc.text("Aucun produit trouvé pour cette commande.");
      }

      // Vérification de la présence de prix
      const prixTotalHT = command.prix_total_ht ? command.prix_total_ht.toFixed(2) : "N/A";
      const tvaTotale = command.tva_totale ? command.tva_totale.toFixed(2) : "N/A";
      const totalTTC = command.total_ttc ? command.total_ttc.toFixed(2) : "N/A";

      
      doc.text(`Prix total HT: ${prixTotalHT} TND`);
      doc.text(`TVA totale: ${tvaTotale} TND`);
      doc.text(`Total TTC: ${totalTTC} TND`).moveDown(2);
    });

    // Terminer le document PDF
    doc.end();

    // Envoyer le fichier PDF au client
    writeStream.on('finish', () => {
      res.download(pdfPath, pdfPath, (err) => {
        if (err) {
          console.error('Erreur lors de l\'envoi du PDF:', err);
          return res.status(500).json({ message: 'Erreur lors de l\'envoi du PDF.' });
        }
        fs.unlinkSync(pdfPath); // Supprimer le fichier après l'envoi
      });
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return res.status(500).json({ message: 'Erreur lors de la génération du PDF.', error: error.message });
  }
};
