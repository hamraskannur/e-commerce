const mongoose = require( "mongoose" );

const Schema = mongoose.Schema;

const messagechema = new Schema({
    Email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date:{
        type:String,
        required: true

    }
})

          
module.exports = mongoose.model( "messages",messagechema);