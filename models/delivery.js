/*

const mongoose=require('mongoose')
const validator=require('validator')
const livModule=new mongoose.Schema({
    proName:{
    type:String,
    required:[true,'product name is required'],
    trim:true
    },
    idCom:{
    unique:true,
    required:[true,'last name is required'],
    trim:true
    },
    dateliv:{
        type:Date,
        required:[true,'product name is required'],
    },
    prix:{
        prixart:{
            type:Number,
            required:[true,'last name is required']
        },
        prixTot:{
            type:Number,
            required:[true,'last name is required']
        },
        fraisLiv:{
            type:Number,
            required:[true,'last name is required']
        }
    },
    quantity:{
        type:Number,
        required:[true,'last name is required']
    },
    livType:{
        type:{

        },
        prix:{

        },
    },
    comStatus:{
        type:Number,
    },
    rating:{
        type:Number,
    },
},{timetamps:true});
module.exports=mongoose.model('liv',livModule)*/
const mongoose = require('mongoose');
// Order Delivery Schema
const OrderDeliverySchema = new mongoose.Schema({
  comId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    unique:true,
    required: [true,'commande id is required'],
  },
  deliveryOption: {
    type:String,
    option: ['Standard Shipping', 'Express Shipping', 'Pickup from Store', 'Courier Delivery'],
    default :'Standard Shipping',
    required: [true,'delivery option is required'],
  },
  address: {
    type:String,
    required: [true,'address is required']
  },
  deliveryStatus: {
    type: String,
    option: ['Pending', 'Shipped', 'In Transit', 'Delivered'],
    default: 'Pending',
    required: [true,'status is required']
  },
  prixTot: {
    type:Number,
    required: true,
    required: [true,'prix total is required']
  },
  comment:{
    type: String,
  },
  deliveryDate:{
    type: Date
  },
  quantity:{
    type:Number,
    required: true,
    required: [true,'quantity is required']
  }
});

module.exports = mongoose.model('OrderDelivery', OrderDeliverySchema);