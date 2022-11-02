const mongoose = require('mongoose');

const Schema = mongoose.Schema;





const userSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    userstatus:{
        type: String,
        required: true
    },
    PhoneNo:{
        type: String,
        required: true
    },
    userdetails:{
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
    },
    Coupons:{
        type:Array
    }
   
    
})

module.exports = mongoose.model( 'user',userSchema );

