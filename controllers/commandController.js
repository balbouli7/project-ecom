const mongoose = require("mongoose");
const Command = require("../models/command");
const user = require("../models/user");
const Product = require("../models/Product");
//--------------------------
// pdf
const PDFDocument = require("pdfkit");
const fs = require("fs");
const Test = require("supertest/lib/test");
//--------------------------
//email
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
require("dotenv").config();
const { error, info } = require("console");
//--------------------------
//excel
const ExcelJS = require("exceljs");
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


//---------------------------------------------------------------------
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
//pdf tous le produit

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
      // affichier dernier 4 nomnre de id 
      const shortId = command._id.toString().slice(-4);
      doc.text(`Nom de la commande:${shortId}`);
  // affichier tous le id 
      doc.text(`Nom de la commande: ${command._id || "Nom inconnu"}`);
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
            doc.text(`  - Produit: ${prod.name || "Nom inconnu"}`);
            doc.text(`  - Quantité: ${prod.quantite || 0}`);
            doc.text(`  - Prix unitaire HT: ${prod.prix_unitaire_ht ? prod.prix_unitaire_ht.toFixed(2) : "N/A"} TND`);
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
//------------------------------------------
// PDF id

exports.generateCommandPDFid = async (req, res) => {
  try {
    // Récupérer l'ID de la commande depuis les paramètres de la requête
    const { id } = req.params;

    // Récupérer la commande spécifique avec ses produits
    const command = await Command.findById(id)
   /* .populate({
      path: 'products.productId',  // Assure-toi que 'productId' est la clé correcte
      select: 'name prix_unitaire_ht' // Sélection des champs du produit
    });*/

    if (!command) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    // Créer un document PDF
    const doc = new PDFDocument();
    const pdfPath = `Command_${command._id}.pdf`;
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Titre du PDF
    doc.fontSize(20).text('Détails de la Commande', { align: 'center' }).moveDown();
    
// Afficher les 4 derniers caractères de l'ID
const shortId = command._id.toString().slice(-4);
doc.fontSize(14).text(`ID de la commande (dernier chiffre) : ${shortId}`).moveDown();


    // ID de la commande
    doc.fontSize(14).text(`ID de la commande: ${command._id}`).moveDown();

    // Date de la commande
    doc.text(`Date de la commande: ${command.orderDate ? new Date(command.orderDate).toLocaleString() : 'Date inconnue'}`).moveDown();

    // Statut de la commande
    doc.text(`Statut: ${command.status || 'Statut inconnu'}`).moveDown();

    // Affichage des produits
    doc.text('Produits:', { underline: true }).moveDown();
    if (command.products && command.products.length > 0) {
      command.products.forEach(prod => {
        const product = prod.productId; // Récupérer le produit avec populate
        doc.text(`  - Produit: ${prod.name || 'Nom inconnu'}`);
        doc.text(`  - Quantité: ${prod.quantite || 0}`);
        doc.text(`  - Prix unitaire HT: ${prod.prix_unitaire_ht ? prod.prix_unitaire_ht.toFixed(2) : 'N/A'} TND`);
        doc.moveDown(0.5);
      });
    } else {
      doc.text('Aucun produit trouvé pour cette commande.').moveDown();
    }

    // Affichage des prix
    const prixTotalHT = command.prix_total_ht ? command.prix_total_ht.toFixed(2) : 'N/A';
    const tvaTotale = command.tva_totale ? command.tva_totale.toFixed(2) : 'N/A';
    const totalTTC = command.total_ttc ? command.total_ttc.toFixed(2) : 'N/A';

    doc.text(`Prix total HT: ${prixTotalHT} TND`).moveDown();
    doc.text(`TVA totale: ${tvaTotale} TND`).moveDown();
    doc.text(`Total TTC: ${totalTTC} TND`).moveDown(2);

    // Terminer le document PDF
    doc.end();

    // Envoyer le fichier PDF au client
    writeStream.on('finish', () => {
      res.download(pdfPath, (err) => {
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
//----------------------------------------------
//forget password

exports.forgetPassword = async (req, res) => {
  const nodemailer = require('nodemailer');

  // Vérifiez si les variables d'environnement sont définies
  if (!process.env.EMAIL || !process.env.passwordEmail) {
    return res.status(500).json({
      message: "Les variables d'environnement EMAIL ou passwordEmail ne sont pas définies.",
    });
  }

  // Récupérez l'email du destinataire à partir du corps de la requête
  const { email } = req.body;

  // Vérifiez que l'email est bien fourni dans la requête
  if (!email) {
    return res.status(400).json({
      message: "L'email du destinataire est requis.",
    });
  }

  // Configuration du transporteur d'email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,    // L'email de votre compte
      pass: process.env.passwordEmail,  // Le mot de passe ou le mot de passe d'application
    },
  });
const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"15m"})
  // Configuration des options de l'email
  const mailOptions = {
    from: process.env.EMAIL,  // L'email de l'expéditeur
    to: email,  // L'email du destinataire, récupéré de la requête
    subject: 'Test Email',
   text: `http://localhost:5000/api/resetpassword/${token}`,
 
};

  // Envoi de l'email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur d\'envoi de l\'email:', error);
      return res.status(500).json({
        message: 'Erreur d\'envoi de l\'email',
        error: error.message,  // Affichez le message d'erreur détaillé
      });
    }

    console.log('Email envoyé avec succès:', info.response);
    res.status(200).json({
      message: 'Email envoyé avec succès',
      info: info.response,
    });
  });
};
//---------------------------------------------------

//email
exports.sendTestEmail = async (req, res) => {
  const nodemailer = require('nodemailer');

  // Vérifiez si les variables d'environnement sont définies
  if (!process.env.EMAIL || !process.env.passwordEmail) {
    return res.status(500).json({
      message: "Les variables d'environnement EMAIL ou passwordEmail ne sont pas définies.",
    });
  }

  // Récupérez l'email, test, et status à partir du corps de la requête
  const { email, test, status } = req.body;

  // Vérifiez que l'email, test et status sont bien fournis dans la requête
  if (!email || !test || !status) {
    return res.status(400).json({
      message: "L'email, le message de test et le statut sont requis.",
    });
  }

  // Configuration du transporteur d'email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,    // L'email de votre compte
      pass: process.env.passwordEmail,  // Le mot de passe ou le mot de passe d'application
    },
  });

  // Configuration des options de l'email avec les variables test et status dans le texte
  const mailOptions = {
    from: process.env.EMAIL,  // L'email de l'expéditeur
    to: email,  // L'email du destinataire, récupéré de la requête
    subject: 'Test Email',
    //text: `Test Message: ${test}\n le commande est : ${status}`,  // Texte du message avec test et status
    text: ` ${test}\n le commande est : ${status}`, 
  };

  // Envoi de l'email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur d\'envoi de l\'email:', error);
      return res.status(500).json({
        message: 'Erreur d\'envoi de l\'email',
        error: error.message,  // Affichez le message d'erreur détaillé
      });
    }

    console.log('Email envoyé avec succès:', info.response);
    res.status(200).json({
      message: 'Email envoyé avec succès',
      info: info.response,
    });
  });
};
//----------------------------------------------
// affichier par status
exports.getCommandsByStatus = async (req, res) => {
  try {
    // Récupérer le status depuis les paramètres de la requête
    const { status } = req.query;

    // Vérifier si le status est fourni
    if (!status) {
      return res.status(400).json({ error: "Le status est requis." });
    }

    // Trouver les commandes filtrées par status
    const commandes = await Command.find({ status: status })
      //.populate('products.productId');  // Peupler les produits dans la commande

    // Si aucune commande n'est trouvée
    if (commandes.length === 0) {
      return res.status(404).json({ error: `Aucune commande trouvée avec le status '${status}'.` });
    }

    // Retourner les commandes trouvées
    res.status(200).json(commandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur", details: error.message });
  }
};


//------------------------------------------------
//excel



exports.exportCommandsToExcel = async (req, res) => {
  try {
    // Récupérer toutes les commandes
    const commandes = await Command.find();

    // Vérifier si les commandes existent et ne sont pas vides
    if (!commandes || commandes.length === 0) {
      return res.status(404).json({ error: "Aucune commande trouvée." });
    }

    // Créer un nouveau classeur Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Commandes");

    // Ajouter des en-têtes à la feuille
    worksheet.columns = [
      { header: "ID Commande", key: "_id", width: 20 },
      { header: "Date", key: "orderDate", width: 20 },
      { header: "Utilisateur", key: "userId", width: 25 },
      { header: "Produits", key: "products", width: 50 },
      { header: "Prix Total HT", key: "prix_total_ht", width: 15 },
      { header: "TVA Totale", key: "tva_totale", width: 15 },
      { header: "Total TTC", key: "total_ttc", width: 15 },
      { header: "Statut", key: "status", width: 15 },
    ];

    // Ajouter des données pour chaque commande
    commandes.forEach((commande) => {
      const productDetails = commande.products
        .map(
          (product) =>
            `Nom: ${product.name}, Quantité: ${product.quantite}, Prix: ${product.prix_unitaire_ht}`
        )
        .join("\n");

      worksheet.addRow({
        _id: commande._id.toString(),
        orderDate: commande.orderDate.toISOString().split("T")[0],
        user: commande.userId ? commande.userId.name : "Utilisateur inconnu",
        products: productDetails,
        prix_total_ht: commande.prix_total_ht.toFixed(2),
        tva_totale: commande.tva_totale.toFixed(2),
        total_ttc: commande.total_ttc.toFixed(2),
        status: commande.status,
      });
    });

    // Appliquer des bordures aux cellules
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Configurer les en-têtes de réponse pour le téléchargement du fichier Excel
    const fileName = 'commandes.xlsx';
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}`
    );

    // Envoyer le fichier Excel
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur", details: error.message });
  }
};