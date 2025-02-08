const express = require('express');
//-----------------------------

const router = express.Router();
const { createCommand ,getAllCommands,updateCommand,
  deleteCommand,getCommandById,getCommandsByDate,
  getCommandsByUser,deleteProductFromCommand,
  updateProductInCommand,generateCommandPDF,
  generateCommandPDFid , forgetPassword,
  sendTestEmail ,getCommandsByStatus,
  exportCommandsToExcel
  
} = require('../controllers/commandController'); // Assurez-vous que le chemin vers le contrôleur est correct de ligne

// Route pour créer une commande
//ajouter
router.post('/createCommand', createCommand);
//affichier tous
router.get('/getAllCommands', getAllCommands); 
//modifier qte
router.put('/updateCommand/:id', updateCommand);
//supprime tous
router.delete('/deleteCommand/:id', deleteCommand);
//--------------
//affiche id
router.get('/getCommandById/:id', getCommandById);
//affichie par date
router.get('/getCommandsByDate', getCommandsByDate);
//afficgier par user
router.get('/getCommandsByUser', getCommandsByUser);
//-----------------
//supprime par produit 
router.delete('/deleteProductFromCommand/:commandId/:productId', deleteProductFromCommand);
//modifier par id
router.put('/updateProductInCommand/:commandId/:productId', updateProductInCommand);
//-------------------
//pdf tous le pdt 
router.get('/generateCommandPDF', generateCommandPDF);
router.get('/generateCommandPDFid/:id', generateCommandPDFid);
//------------------------
//email
router.post('/forgetPassword',forgetPassword);

router.post('/sendtestemail', sendTestEmail);
//--------------------------
router.get('/getCommandsByStatus', getCommandsByStatus);
//--------------------------
//excel
router.get("/export", exportCommandsToExcel);

module.exports = router;
