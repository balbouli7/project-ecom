const { Receive } = require('twilio/lib/twiml/FaxResponse');
const OrderDelivery=require('../models/delivery')
// Add a new delivery
exports.addDelivery = async (req, res) => {
  try {
    const delivery = new OrderDelivery(req.body)
    console.log(req.body)
    await delivery.save();
    res.status(201).send({ message: 'Delivery added successfully', delivery });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Remove a delivery
exports.removeDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const result = await OrderDelivery.findByIdAndDelete(deliveryId);
    if (!result) {
      return res.status(404).send({ error: 'Delivery not found' });
    }
    res.status(200).send({ message: 'Delivery removed successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Shipped', 'In Transit', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({ error: 'Invalid delivery status' });
    }

    const delivery = await OrderDelivery.findByIdAndUpdate(
      deliveryId,
      { deliveryStatus: status },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).send({ error: 'Delivery not found' });
    }

    res.status(200).send({ message: 'Delivery status updated', delivery });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get delivery details
exports.getDeliveryDetails = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await OrderDelivery.findById(deliveryId);

    if (!delivery) {
      return res.status(404).send({ error: 'Delivery not found' });
    }

    res.status(200).send(delivery);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
const axios = require("axios");
exports.getCoordinates= async (req, res) => {
    try {
        const address = req.params.customerAddress;
        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        // openStreetMap api url
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        
        // get the coordinates from OpenStreetMap
        const response = await axios.get(url);

        // send error if there is no data
        if (!response.data || response.data.length === 0) {
            return res.status(404).json({ error: "Location not found" });
        }
        // Extract lat and lon from result
        const { lat, lon } = response.data[0];

        //Receive lat and lon with json
        return res.status(200).json({ latitude: lat, longitude: lon });

    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return res.status(500).json({ error: "Failed to fetch coordinates", details: error.message });
    }

};
const twilio = require('twilio');


// async func to send msg
exports.updatedeliverymsg = async (req, res) => {
  // account sid and auth token
const accountSid = 'ACdeaedc6487cae2c103e40fd4fc498a30';  // Your Twilio Account SID
const authToken = '342e9c7c36659e1386cdc4b02cc07012';  // Your Twilio Auth Token
const client = new twilio(accountSid, authToken);

// my number 
const fromPhoneNumber = '+15074458846';  //Twilio number
    try {


        const { clientPhone, deliveryId } = req.body; // Get client's phone number and order ID from request body

        if (!clientPhone || !deliveryId) {
            return res.status(400).json({ error: "Missing clientPhone or orderId" });
        }

        const message = `Your delivery order #${deliveryId} has been shipped! 🚚📦`;

        // Send SMS with twilio
        await client.messages.create({
            body: message,
            from: fromPhoneNumber,  // My phone number
            to: clientPhone,  // Customer phone number
        });

        return res.status(200).json({ message: "SMS sent successfully",deliveryId });

    } catch (error) {
        console.error("Error sending SMS:", error);
        return res.status(500).json({ error: "Failed to send SMS", details: error.message });
    }
};
