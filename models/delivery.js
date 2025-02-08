const mongoose = require('mongoose');
// Order Delivery Schema
const OrderDeliverySchema = new mongoose.Schema({
  comId: {
    type: String, 
    ref: 'Order',
    unique:true,
    required: [true,'commande id is required'],
  },
  deliveryOption: {
    type:String,
    enum: ['Standard Shipping', 'Express Shipping', 'Pickup from Store', 'Courier Delivery'],
    default :'Standard Shipping',
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Shipped', 'In queue', 'Delivered'],
    default: 'Pending',
  },
  prixTot: {
    type:Number,
    required: [true,'prix total is required']
  },
  comment:{
    type: String,
  
  },
  quantity:{
    type:Number,
    required: true,
    required: [true,'quantity is required'],
  },
  customerAddress: {
    type: String,
    required: true 
  },
  clientPhone:{
    type:String,
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now },
});

module.exports = mongoose.model('OrderDelivery', OrderDeliverySchema);