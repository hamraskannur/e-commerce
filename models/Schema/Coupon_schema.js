const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CouponSchema = new Schema({
    CouponName: {
        type: String,
        required: true
    },
    Couponcode: {
        type: String,
        required: true
    },
    discount: {
        type: String,
        required: true
    },
    isActive: {
        type: String,
        require: true
    },
    maxlimite: {
        type: Number,
        require: true
    },
    minpurchase: {
        type: String,
        required: true
    },
    expdate: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('Coupon', CouponSchema);