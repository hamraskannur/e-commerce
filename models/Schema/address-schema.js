const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const addresDetailsSchema = new Schema({
    Name: {
        type: String,
    },
    PhoneNo: {
        type: String,
    },
    Address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    localAddres: {
        type: String,
    },
    zip: {
        type: String,
    },
    Payment: {
        type: String,
    }

    
})

const addressSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    adress: [addresDetailsSchema]
})


module.exports = mongoose.model( 'address',addressSchema );