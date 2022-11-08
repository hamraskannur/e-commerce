

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bannersSchema = new Schema({
    image: {
        type: String
    },
    title: {
        type: String,
    },
    title2: {
        type: String,
    },
    category: {
        type: String
    },
    home:{
        type: String   
    },
    productlink:{
        type: String   

    }

})

const bannerSchema = new Schema({
    bannerName: {
        type: String,
        required: true
    }, description: {
        type: String,
        required: true
    },

    items: [bannersSchema]
    , instagram: {
        type: String
    },
    Facebook:{
    type: String
    },
    PhoneNo:{
        type: String   
    },
    help1:{
        type: String   

    },
    help2:{
        type: String   

    },
    help3:{
        type: String   

    },
    help4:{
        type: String   

    },
    bannerId:{
        type: String   

    },
    map:{
        type: String   

    },
    email:{
        type: String   

    },
    address:{
        type: String   

    },
    homepagefirst:{
        type: String   

    }
})

module.exports = mongoose.model("banner", bannerSchema);