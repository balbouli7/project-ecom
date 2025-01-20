const express = require("express");
const {
  createCommand,
  getCommands,
  updateCommand,
  deleteCommand,
} = require("../controllers/commandController"); // Importez les contrôleurs des commandes
const router = express.Router();

// Route pour créer une commande
router.post("/createCommand", createCommand);

// Route pour récupérer toutes les commandes
router.get("/getCommands", getCommands);

//modifier

router.put("/updateCommand/:id", updateCommand);
//supprime

router.delete("/deleteCommand/:id", deleteCommand);

module.exports = router;
