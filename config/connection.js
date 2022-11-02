
const mongoose = require('mongoose');

module.exports.db=mongoose.connect(process.env.MONGOOSE_CONNECTION)

mongoose.connection
.once("open",()=>console.log("connected"))
.on("error",error=>{
    console.log("your error",error);
})

