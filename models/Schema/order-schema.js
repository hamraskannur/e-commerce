const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productsSchema = new Schema({
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        require: true
    },
    totalprice:{
        type: Number,
        require: true
    },
    product:{
     type:Array,
     required: true
    },
    userdetails:{
      type:Array,
      required: true
    }

   
})
const orderSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    orders: [productsSchema]
})


module.exports = mongoose.model('order', orderSchema);