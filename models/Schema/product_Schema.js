const mongoose = require( "mongoose" );

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    Images:{
        type:Array,
        require:true
    }
})

          
module.exports = mongoose.model( "Product", productSchema );