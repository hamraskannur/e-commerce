const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productsSchema = new Schema({
    productId: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: String,
        required: true
    }, name: {
        type: String,
        required: true
    },
    orderStatus:{
        type: String
    } ,images:{
        type:Array,
    }
})
const cartSchema = new Schema({
    userId: {
        type: String,
        required: true
    }, bill : {
        type: String,
        required: true
    },
    totalquantity:{
        type: String,
        required: true
    },
    items: [productsSchema]
})

module.exports = mongoose.model("carts", cartSchema);