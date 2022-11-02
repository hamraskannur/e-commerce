const { response } = require('express');
const mongoose = require('mongoose');
const db = require('../config/connection')
const admin_colloction = require('../models/Schema/admin_Schema')
const user_collection = require('../models/Schema/user_Schema')
const order_collection = require('../models/Schema/order-schema')
const Category_collection = require('../models/Schema/Category_schema')
const Coupon_colection = require('../models/Schema/Coupon_schema')
const banner_collection = require('../models/Schema/banner _schema')
const message_collection = require('../models/Schema/message_schema')

const otpGenerator = require('otp-generator')
let couponCode = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false });

module.exports = {
    adminlogin: (adminId) => {
        return new Promise((resolve, reject) => {
            if(adminId.loginEmail){
                if (adminId.loginPassword) {
                    /////
                    admin_colloction.find((err, data) => {
                        let response = {
                            admin: null,
                            Status: false,
                            loginMessage: null
                        }
                        if (!err) {
                            if (data[0].Email === adminId.loginEmail && data[0].Password === adminId.loginPassword) {
                                response.admin = data
                                response.Status = true
                                resolve(response)
                            } else {
                                response.Status = false
                                response.loginMessage = "! Email or password is wrong!"
                                resolve(response)
                            }
    
                        } else {
                            response.Status = false
                            resolve(response)
                            console.log(err);
                        }
                    })
                    /////
                }
            }
            


        })

    },
    getuserdetails: () => {
        return new Promise((resolve, reject) => {
            user_collection.find((err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    console.log(err);
                }
            })
        })
    },

    userBlocking: (userId) => {
        return new Promise((resolve, reject) => {
            let response = {
                status: false,
                userExist: null
            }
            user_collection.updateOne({ _id: userId }, {
                $set: {
                    userstatus: "Block"
                }
            }).then((data, err) => {
                if (data) {
                    response.Status = true
                    resolve(response)
                } else {
                    console.log(err);
                    response.Status = false
                    resolve(response)
                }
            })


        })
    },
    UserUnblocking: (userId) => {
        return new Promise((resolve, reject) => {
            let response = {
                Status: false
            }
            user_collection.updateOne({ _id: userId }, {
                $set: {
                    userstatus: "active"
                }
            }).then((data, err) => {
                if (data) {
                    response.Status = true
                    resolve(response)
                } else {
                    console.log(err);
                    response.Status = false
                    resolve(response)
                }
            })


        })
    },
    orderslist: () => {
        return new Promise(async (resolve, reject) => {
            data = await order_collection.aggregate(
                [

                    { $unwind: "$orders" },
                    {
                        $project: { orders: 1 }
                    },
                    {
                        $sort: { "orders.date": -1 }
                    }
                ]

            )
            resolve(data)
        })
    },
    GetOdersProduct: (orderId) => {
        return new Promise(async (resolve, reject) => {
            var id = mongoose.Types.ObjectId(orderId);
            data = await order_collection.aggregate(
                [

                    { $unwind: "$orders" },
                    {
                        $project: { orders: 1 }
                    },
                    {
                        $match: { "orders._id": id }
                    }
                ]

            )
            resolve(data)
        })
    },
    getpaymentoders: (payment) => {
        return new Promise(async (resolve, reject) => {
            data = await order_collection.aggregate(
                [

                    { $unwind: "$orders" },
                    {
                        $project: { orders: 1 }
                    },
                    {
                        $match: { "orders.userdetails.Payment": payment }
                    },
                    {
                        $sort: { "orders.date": -1 }
                    }
                ]

            )
            resolve(data)
        })
    },
    getCancelOrder: (Status) => {
        return new Promise(async (resolve, reject) => {
            data = await order_collection.aggregate(
                [

                    { $unwind: "$orders" },
                    {
                        $project: { orders: 1 }
                    },
                    {
                        $match: { "orders.orderStatus": Status }
                    },
                    {
                        $sort: { "orders.date": -1 }
                    }
                ]

            )
            resolve(data)
        })
    },
    getDailySales: () => {
        return new Promise(async (resolve, reject) => {

            data = await order_collection.aggregate(
                [

                    { $unwind: "$orders" },
                    {
                        $project: { orders: 1 }
                    },
                    {
                        $match: { "orders.orderStatus": "placed" }
                    }, {
                        $project: { "orders.date": 1, "orders.totalprice": 1 }
                    },

                    {
                        "$group": {
                            "_id": "$orders.date",
                            "totalprice": {
                                "$sum": "$orders.totalprice"
                            }
                        }
                    },
                    {
                        $sort: { "_id": -1 }
                    }
                ]

            ).limit(7)
            datas = data.reverse()
            resolve(datas)
        })
    }
    ,
    getDailyCancelOrder: () => {
        return new Promise(async (resolve, reject) => {
            data = await order_collection.aggregate(
                [

                    { $unwind: "$orders" },
                    {
                        $project: { orders: 1 }
                    },
                    {
                        $match: { "orders.orderStatus": "canceled" }
                    }, {
                        $project: { "orders.date": 1, "orders.totalprice": 1 }
                    },

                    {
                        "$group": {
                            "_id": "$orders.date",
                            "totalprice": {
                                "$sum": "$orders.totalprice"
                            }
                        }
                    },
                    {
                        $sort: { "_id": -1 }
                    }
                ]

            ).limit(7)
            datas = data.reverse()

            resolve(datas)
        })
    },
    gettodaysellprice: () => {
        let date = new Date().toJSON().slice(0, 10);
        return new Promise(async (resolve, reject) => {
            result = {
                todaytotalprice: "0",
                usercount: "0",
                pendingproduct: "0",
                cancelproduct: "0"
            }
            todaytotalprice = await order_collection.aggregate(
                [

                    { $unwind: "$orders" },
                    {
                        $project: { orders: 1 }
                    },
                    {
                        $match: { "orders.orderStatus": "placed" }
                    },
                    {
                        $match: { "orders.date": date }
                    },
                    {
                        $project: { "orders.date": 1, "orders.totalprice": 1, "orders.product": 1 }
                    },
                    {
                        "$group": {
                            "_id": "$orders.date",
                            "totalprice": {
                                "$sum": "$orders.totalprice"
                            }
                        }
                    }
                ]

            )

            usercount = await order_collection.aggregate(
                [

                    { $unwind: "$orders" },

                    {
                        $match: { "orders.orderStatus": "placed" }
                    },
                    {
                        $match: { "orders.date": date }
                    },
                    { $count: 'totalCount' }

                ]

            )


            pendingproduct = await order_collection.aggregate(
                [

                    { $unwind: "$orders" },

                    {
                        $match: { "orders.orderStatus": "pending" }
                    },
                    {
                        $match: { "orders.date": date }
                    },
                    { $count: 'totalCount' }

                ]

            )
            cancelproduct = await order_collection.aggregate(
                [

                    { $unwind: "$orders" },

                    {
                        $match: { "orders.orderStatus": "cancel" }
                    },
                    {
                        $match: { "orders.date": date }
                    },
                    { $count: 'totalCount' }

                ]

            )
            result.cancelproduct = cancelproduct
            result.todaytotalprice = todaytotalprice
            result.usercount = usercount
            result.pendingproduct = pendingproduct
            resolve(result)
        })
    }
    ,
    salesReport: () => {
        return new Promise(async (resolve, reject) => {
            salesReport = await order_collection.aggregate(
                [
                    { $unwind: "$orders" },

                    {
                        $match: { "orders.orderStatus": "placed" }
                    },
                    {
                        $group: {
                            _id: "$orders.date",
                            totalprice: {
                                $sum: "$orders.totalprice"
                            }
                        }
                    },
                    {
                        $sort: { "_id": -1 }
                    }
                ]

            ).limit(30)

            resolve(salesReport)
        })
    },
    salesReporttotal: () => {
        return new Promise(async (resolve, reject) => {
            salesReporttotal = await order_collection.aggregate(
                [
                    { $unwind: "$orders" },

                    {
                        $match: { "orders.orderStatus": "placed" }
                    },
                    {
                        $group: {
                            _id: "$orders.date",
                            orderCount: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { "_id": -1 }
                    }
                ]

            ).limit(30)
            resolve(salesReporttotal)
        })



    },
    salesReportTotalprice: () => {
        return new Promise(async (resolve, reject) => {
            Totalprice = await order_collection.aggregate(
                [
                    { $unwind: "$orders" },

                    {
                        $match: { "orders.orderStatus": "placed" }
                    },
                    {
                        $group: {
                            _id: null,
                            totalprice: {
                                $sum: "$orders.totalprice"
                            }
                        }
                    },
                    {
                        $sort: { "_id": -1 }
                    }

                ]

            )
            resolve(Totalprice)
        })


    },
    postaddCoupon: (Coupon) => {
        let response = {
            Status: false
        }
        Couponcodes = Coupon.Couponcode
        return new Promise(async (resolve, reject) => {
            Coupon_colection.find({ Couponcode: Couponcodes }, (err, data) => {
                if (data.length == 0) {
                    const NewCoupon = new Coupon_colection({
                        CouponName: Coupon.CouponName,
                        Couponcode: couponCode,
                        discount: Coupon.discount,
                        maxlimite: Coupon.maxlimite,
                        isActive: 'true',
                        minpurchase: Coupon.minpurchase,
                        expdate: Coupon.expdate
                    })
                    NewCoupon.save().then((data) => {
                        response.Status = true
                        resolve(response)
                    })
                } else {
                    response.Status = false
                    resolve(response)
                }
            })
        })
    },

    getCouponPage: () => {
        return new Promise(async (resolve, reject) => {
            Coupon_colection.find((err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    console.log(err);
                }
            })

        })

    },
    getOneCoupon: (_id) => {
        return new Promise(async (resolve, reject) => {
            let response = {
                data: null,
                Status: true
            }
            Coupon_colection.findById(_id, (err, data) => {
                if (!err) {
                    response.data = data
                    response.Status = true
                    resolve(response)
                } else {
                    response.Status = false
                    console.log(err);
                    resolve(response)
                }

            })
        })
    },
    postEditeCoupon: (Coupon, coupenId) => {
        return new Promise(async (resolve, reject) => {

            Coupon_colection.updateOne({ _id: coupenId }, {
                $set: {
                    CouponName: Coupon.CouponName,
                    discount: Coupon.discount,
                    maxlimite: Coupon.maxlimite,
                    isActive: 'true',
                    minpurchase: Coupon.minpurchase,
                    expdate: Coupon.expdate
                }
            }).then((err, data) => {
                if (!err) {
                    resolve()
                } else {
                    console.log(err);
                    resolve()
                }
            })

        })
    },
    deletecoupon: (couponId, change) => {
        return new Promise(async (resolve, reject) => {

            Coupon_colection.updateOne({ _id: couponId }, {
                $set: { isActive: change }
            }).then((err, data) => {
                if (!err) {
                    resolve()
                } else {
                    console.log(err);
                    resolve()
                }
            })

        })
    },
    getAllbanners: () => {
        return new Promise((resolve, reject) => {
            banner_collection.find((err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    console.log(err);
                }
            })


        })
    },
    getBannersMore: (bannerId) => {

        return new Promise(async (resolve, reject) => {
            let banner = await banner_collection.findOne({ _id: bannerId })

            resolve(banner)
        })
    },
    getbannerone: (bannerId, insideId) => {
        return new Promise(async (resolve, reject) => {
            let banner = await banner_collection.findOne({ _id: bannerId })
            let itemIndex = banner.items.findIndex(p => p._id == insideId);
            if (itemIndex > -1) {
                let bannerItem = banner.items[itemIndex];
                resolve(bannerItem)

            }
        })
    }
    ,
    editBanner: (bannerdetails, bannerId) => {
        return new Promise(async (resolve, reject) => {

            let banner = await banner_collection.findOne({ _id: bannerId })
            let itemIndex = banner.items.findIndex(p => p._id == bannerdetails._id);
            if (itemIndex > -1) {
                let bannerItem = banner.items[itemIndex];
                if (bannerdetails.img) {
                    bannerItem.image = bannerdetails.img
                }
                if (bannerdetails.category) {
                    bannerItem.category = bannerdetails.category
                }
                if (bannerdetails.productlink) {
                    bannerItem.productlink = bannerdetails.productlink

                }
                bannerItem.title = bannerdetails.title
                bannerItem.title2 = bannerdetails.title2
                banner.items[itemIndex] = bannerItem
            }
            banner.save()
            resolve()

        })
    },
    getlastweekpro: () => {
        return new Promise(async (resolve, reject) => {
            profit = await order_collection.aggregate(
                [
                    { $unwind: "$orders" },

                    {
                        $match: { "orders.orderStatus": "placed" }
                    },
                    {
                        $group: {
                            _id: "$orders.date",
                            totalprice: {
                                $sum: "$orders.totalprice"
                            }
                        }
                    },
                    {
                        $sort: { "_id": -1 }
                    }

                ]

            ).limit(7)
            resolve(profit)
        })

    },
    changeStatus: (Status, orderId, insideorderId) => {
        let orderStatus = false
        return new Promise(async (resolve, reject) => {
            let order = await order_collection.findOne({ _id: orderId });
            let orderIndex = order.orders.findIndex(p => p._id == insideorderId);
            if (orderIndex > -1) {
                let orderItem = order.orders[orderIndex];
                orderItem.orderStatus = Status
                order.orders[orderIndex] = orderItem
                order.save()
                orderStatus = true
            }
            resolve(orderStatus)
        })
    },
    editFooter: (footer) => {
        return new Promise(async (resolve, reject) => {
         
            let banner = await banner_collection.findOne({ bannerId: "Footer" })
            banner.PhoneNo = footer.PhoneNo
            banner.Facebook = footer.Facebook
            banner.instagram = footer.instagram
            banner.help1 = footer.help1
            banner.help2 = footer.help2
            banner.help3 = footer.help3
            banner.help4 = footer.help4
            banner.save()
            resolve()
        })

    },
    getAllMessages: () => {
        return new Promise((resolve, reject) => {
            message_collection.find((err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    console.log(err);
                }
            })

        })

    },
    getoneMessage: (messageId) => {
        return new Promise((resolve, reject) => {
            message_collection.findById(messageId, (err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    console.log(err);
                }
            })
        })
    }

}

