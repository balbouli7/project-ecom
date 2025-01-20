const express = require('express');
const {addDelivery,removeDelivery,updateDeliveryStatus,getDeliveryDetails,} = require('../controllers/deliveryControllers');

const router = express.Router();

// Add a delivery
router.post('/delivery/Adding', addDelivery);

// Remove a delivery
router.delete('/delivery/:deliveryId', removeDelivery);

// Update delivery status
router.put('/delivery/:deliveryId/status', updateDeliveryStatus);

// Get delivery details
router.get('/delivery/:deliveryId', getDeliveryDetails);

module.exports = router;