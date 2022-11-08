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
            try {
                if (adminId.loginEmail) {
                    if (adminId.loginPassword) {
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
                            }
                        })
                        /////
                    }
                }

            } catch (err) {
                resolve(err)

            }

        })

    },
    getuserdetails: () => {
        return new Promise((resolve, reject) => {
            try {
                user_collection.find((err, data) => {
                    if (!err) {
                        resolve(data)
                    } else {
                        resolve(err)
                    }
                })
            } catch (err) {
                resolve(err)
                
            }

        })
    },

    userBlocking: (userId) => {
        return new Promise((resolve, reject) => {
            try {

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
                        response.Status = false
                        resolve(response)
                    }
                })
            } catch (err) {
                resolve(err)

            }

        })
    },
    UserUnblocking: (userId) => {
        return new Promise((resolve, reject) => {
            try {

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
                        response.Status = false
                        resolve(response)
                    }
                })
            } catch (err) {
                resolve(err)

            }

        })
    },
    orderslist: () => {
        return new Promise(async (resolve, reject) => {
            try {

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
            } catch (err) {
                resolve(err)

            }
        })
    },
    GetOdersProduct: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })
    },
    getpaymentoders: (payment) => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })
    },
    getCancelOrder: (Status) => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })
    },
    getDailySales: () => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })
    }
    ,
    getDailyCancelOrder: () => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })
    },
    gettodaysellprice: () => {
        let date = new Date().toJSON().slice(0, 10);
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })
    }
    ,
    salesReport: () => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })
    },
    salesReporttotal: () => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })



    },
    salesReportTotalprice: () => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })


    },
    postaddCoupon: (Coupon) => {
        let response = {
            Status: false
        }
        Couponcodes = Coupon.Couponcode
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })
    },

    getCouponPage: () => {
        return new Promise(async (resolve, reject) => {
            try {
                Coupon_colection.find((err, data) => {
                    if (!err) {
                        resolve(data)
                    } else {
                        resolve(err)
                    }
                })
            } catch (err) {
                resolve(err)

            }
        })

    },
    getOneCoupon: (_id) => {
        return new Promise(async (resolve, reject) => {
            try {
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
                        resolve(response)
                    }

                })
            } catch (err) {
                resolve(err)

            }
        })
    },
    postEditeCoupon: (Coupon, coupenId) => {
        return new Promise(async (resolve, reject) => {
            try {
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
                        resolve({Status:true})
                    } else {
                        resolve({Status:false})
                    }
                })
            } catch (err) {
                resolve(err)

            }
        })
    },
    deletecoupon: (couponId, change) => {
        return new Promise(async (resolve, reject) => {
            try {
                Coupon_colection.updateOne({ _id: couponId }, {
                    $set: { isActive: change }
                }).then((err, data) => {
                    if (!err) {
                        resolve({Status:true})
                    } else {
                        resolve({Status:false})
                    }
                })
            } catch (err) {
                resolve(err)

            }
        })
    },
    getAllbanners: () => {
        return new Promise((resolve, reject) => {
            try {
                banner_collection.find((err, data) => {
                    if (!err) {
                        resolve(data)
                    } else {
                        resolve(err)
                    }
                })
            } catch (err) {
                resolve(err)

            }

        })
    },
    getBannersMore: (bannerId) => {

        return new Promise(async (resolve, reject) => {
            try {
                let banner = await banner_collection.findOne({ _id: bannerId })

                resolve(banner)
            } catch (err) {
                resolve(err)

            }
        })
    },
    getbannerone: (bannerId, insideId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let banner = await banner_collection.findOne({ _id: bannerId })
                let itemIndex = banner.items.findIndex(p => p._id == insideId);
                if (itemIndex > -1) {
                    let bannerItem = banner.items[itemIndex];
                    resolve(bannerItem)

                }
            } catch (err) {
                resolve(err)

            }
        })
    }
    ,
    editBanner: (bannerdetails, bannerId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let image=null
                let banner = await banner_collection.findOne({ _id: bannerId })
                let itemIndex = banner.items.findIndex(p => p._id == bannerdetails._id);
                if (itemIndex > -1) {
                    let bannerItem = banner.items[itemIndex];
                    if (bannerdetails.img) {
                        image= bannerItem.image
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
                resolve(image)
            } catch (err) {
                resolve(err)

            }
        })
    },
    getlastweekpro: () => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })

    },
    changeStatus: (Status, orderId, insideorderId) => {
        let orderStatus = false
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                resolve(err)

            }
        })
    },
    editFooter: (footer) => {
        return new Promise(async (resolve, reject) => {
            try {
                let banner = await banner_collection.findOne({ bannerId: "Footer" })
                banner.PhoneNo = footer.PhoneNo
                banner.Facebook = footer.Facebook
                banner.instagram = footer.instagram
                banner.help1 = footer.help1
                banner.help2 = footer.help2
                banner.help3 = footer.help3
                banner.help4 = footer.help4
                banner.save()
                resolve({Status:true})
            } catch (err) {
                resolve(err)

            }
        })

    },
    getAllMessages: () => {
        return new Promise((resolve, reject) => {
            try {
                message_collection.find((err, data) => {
                    if (!err) {
                        resolve(data)
                    } else {
                        resolve(err)
                    }
                })
            } catch (err) {
                resolve(err)

            }
        })

    },
    getoneMessage: (messageId) => {
        return new Promise((resolve, reject) => {
            try {
                message_collection.findById(messageId, (err, data) => {
                    if (!err) {
                        resolve(data)
                    } else {
                        resolve(err)
                    }
                })
            } catch (err) {
                resolve(err)

            }
        })
    },
    posteditcontact: (details) => {
        return new Promise(async (resolve, reject) => {
            try {
                let banner = await banner_collection.findOne({ bannerId: "contact" })
                banner.PhoneNo = details.PhoneNo
                banner.address = details.address
                banner.email = details.Email

                banner.save()
                resolve({Status:true})
            } catch (err) {
                resolve(err)

            }
        })
    }

}

