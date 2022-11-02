const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productsSchema = new Schema({
    productId: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    }, name: {
        type: String,
        required: true
    },
    images:{
        type:Array,
    }
})
const wishlistSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    items: [productsSchema]
})

module.exports = mongoose.model("wishlist", wishlistSchema);