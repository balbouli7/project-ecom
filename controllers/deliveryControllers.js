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