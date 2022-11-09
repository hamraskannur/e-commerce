const mongoose = require('mongoose');
const db = require('../config/connection')
const Razorpay = require('razorpay');
const user_collection = require('../models/Schema/user_Schema')
const cart_Collection = require('../models/Schema/cart_Schema');
const Product_collection = require('../models/Schema/product_Schema')
const wishlist_collection = require('../models/Schema/wishlist_schema')
const order_collection = require('../models/Schema/order-schema')
const Coupon_colection = require('../models/Schema/Coupon_schema')
const banner_collection = require('../models/Schema/banner _schema')
const address_collection = require('../models/Schema/address-schema')
const message_collection = require('../models/Schema/message_schema')
require('dotenv').config()

const session = require('express-session')

const bcrypt = require('bcrypt');
const { promiseImpl } = require('ejs');
const { response } = require('express');
const crypto = require('crypto');
const { resolve } = require('path');


var instance = new Razorpay({
    key_id: process.env.Razorpay_KEY_ID,
    key_secret: process.env.Razorpay_KEY_SECRET,
});

module.exports = {
    checkactive: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await user_collection.find({ Email: userId.Email })
                resolve(user)
            } catch (err) {
                resolve(err)

            }

        })


    },
    DoSignup: (UserData) => {



        return new Promise(async (resolve, reject) => {
            try {
                let user = await user_collection.find({ Email: UserData.Email })
                let Status = {
                    user: null,
                    userExist: false
                }

                if (user.length === 0) {


                    UserData.Password = await bcrypt.hash(UserData.Password, 10)


                    const userlogin = new user_collection({
                        Name: UserData.Name,
                        Email: UserData.Email,
                        Password: UserData.Password,
                        PhoneNo: UserData.PhoneNo,
                        userstatus: "active"
                    })
                    userlogin.save().then((data) => {
                        Status.userExist = false
                        Status.user = UserData
                        let user = {
                            _id: data._id,
                            Email: data.Email
                        }
                        resolve(user)
                    })

                } else {
                    Status.userExist = true
                    resolve(Status)
                }
            } catch (err) {
                resolve(err)

            }
        })

    },
    Dologin: (UserData) => {

        return new Promise(async (resolve, reject) => {
            try {

                let response = {
                    user: null,
                    Status: null,
                    loginMessage: null
                }
                if (UserData.loginEmail) {
                    if (UserData.loginPassword) {
                        let findUser = await user_collection.find({ Email: UserData.loginEmail })
                        if (findUser.length !== 0) {
                            if (findUser[0].userstatus === 'active') {
                                bcrypt.compare(UserData.loginPassword, findUser[0].Password, function (error, isMatch) {
                                    if (error) {
                                        response.Status = false
                                        resolve(response)
                                    } else if (isMatch) {
                                        let user = {
                                            _id: findUser[0]._id,
                                            Email: findUser[0].Email
                                        }
                                        response.user = user
                                        response.Status = true
                                        resolve(response)
                                    } else {
                                        response.loginMessage = " Password is wrong"
                                        response.Status = false
                                        resolve(response)
                                    }

                                })

                            } else {
                                response.loginMessage = "admin block you please sent Message "
                                response.Status = false
                                resolve(response)
                            }

                        } else {
                            response.loginMessage = "your Email wrong"
                            response.Status = false
                            resolve(response)
                        }
                        ///////////
                    }

                }
            } catch (err) {
                resolve(err)

            }
        })

    },
    getcartproduct: (userId) => {

        return new Promise(async (resolve, reject) => {
            try {

                let cart = await cart_Collection.findOne({ userId });
                cartisnot = false
                resolve(cart)
            } catch (err) {
                resolve(err)

            }
        })

    }, AddToCart: (productId, quantity, userId) => {
        let Status = {
            Addproduct: false
        }

        return new Promise(async (resolve, reject) => {
            try {
                let cart = await cart_Collection.findOne({ userId });
                let item = await Product_collection.findOne({ _id: productId });
                if (!item) {
                }
                const price = item.price;
                const name = item.title;

                const images = item.Images

                if (cart) {
                    // if cart exists for the user
                    let itemIndex = cart.items.findIndex(p => p.productId == productId);

                    // Check if product exists or not
                    if (itemIndex > -1) {
                        let productItem = cart.items[itemIndex];
                        productItem.quantity = Number(productItem.quantity) + Number(quantity);
                        cart.items[itemIndex] = productItem;
                    }
                    else {
                        cart.items.push({ productId, name, images, quantity, price });
                        Status.Addproduct = true
                    }
                    cart.totalquantity = Number(cart.totalquantity) + Number(quantity)
                    cart.bill = Number(cart.bill) + (Number(quantity) * Number(price));
                    cart.save();
                    resolve(Status)
                }
                else {
                    // no cart exists, create one
                    const newCart = await cart_Collection.create({
                        userId,
                        items: [{ productId, name, images, quantity, price }],
                        totalquantity: quantity,
                        bill: Number(quantity) * Number(price)
                    });
                    Status.Addproduct = true

                    resolve(Status)
                }
            }
            catch (err) {
                resolve(err)

            }


        })
    },
    AddToCartOne: (productId, userId) => {
        let Status = {
            Addproduct: false
        }
        return new Promise(async (resolve, reject) => {
            try {

                let cart = await cart_Collection.findOne({ userId });
                let item = await Product_collection.findOne({ _id: productId });
                if (!item) {
                }
                const price = item.price;
                const name = item.title;
                const images = item.Images

                if (cart) {
                    // if cart exists for the user
                    let itemIndex = cart.items.findIndex(p => p.productId == productId);

                    // Check if product exists or not
                    if (itemIndex > -1) {
                        let productItem = cart.items[itemIndex];
                        productItem.quantity = Number(productItem.quantity) + 1;
                        cart.items[itemIndex] = productItem;
                        Status.Addproduct = true

                    }
                    else {
                        cart.items.push({ productId, images, name, quantity: 1, price });
                        Status.Addproduct = true

                    }
                    cart.totalquantity = Number(cart.totalquantity) + 1
                    cart.bill = Number(cart.bill) + Number(price);
                    cart.save();
                    resolve(Status)
                }
                else {
                    // no cart exists, create one
                    const newCart = await cart_Collection.create({
                        userId,
                        items: [{ productId, name, images, quantity: 1, price }],
                        totalquantity: 1,
                        bill: Number(1) * Number(price)
                    });
                    Status.Addproduct = true

                    resolve(Status)
                }
            }
            catch (err) {
                resolve(err)

            }


        })
    },
    cartquantityinc: (productId, userId) => {

        return new Promise(async (resolve, reject) => {
            try {

                let item = await Product_collection.findOne({ _id: productId });

                let cart = await cart_Collection.findOne({ userId });
                const price = item.price;

                if (cart) {
                    // if cart exists for the user
                    let itemIndex = cart.items.findIndex(p => p.productId == productId);
                    // Check if product exists or not
                    if (itemIndex > -1) {
                        let productItem = cart.items[itemIndex];
                        productItem.quantity = Number(productItem.quantity) + 1;
                        cart.items[itemIndex] = productItem;
                    }
                    cart.totalquantity = Number(cart.totalquantity) + 1
                    cart.bill = Number(cart.bill) + Number(price);

                    cart.save();
                    resolve({ Status: true })
                }
                else {
                    resolve({ Status: true })
                }
            } catch (err) {
                resolve(err)

            }
        })

    },
    cartquantitydec: (productId, userId) => {

        return new Promise(async (resolve, reject) => {
            try {

                let item = await Product_collection.findOne({ _id: productId });

                let cart = await cart_Collection.findOne({ userId });
                const price = item.price;

                if (cart) {
                    // if cart exists for the user
                    let itemIndex = cart.items.findIndex(p => p.productId == productId);
                    // Check if product exists or not
                    if (itemIndex > -1) {
                        let productItem = cart.items[itemIndex];
                        productItem.quantity = Number(productItem.quantity) - 1;
                        cart.items[itemIndex] = productItem;
                    }
                    cart.totalquantity = Number(cart.totalquantity) - 1
                    cart.bill = Number(cart.bill) - Number(price);

                    cart.save();
                    resolve({ Status: true })
                }
                else {
                    resolve({ Status: true })

                }
            } catch (err) {
                resolve(err)

            }
        })
    },
    cartDeleteProducts: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            Status = false
            try {
                let cart = await cart_Collection.findOne({ userId });
                let itemIndex = cart.items.findIndex(p => p.productId == productId);
                if (itemIndex > -1) {
                    let productItem = cart.items[itemIndex];
                    cart.bill = Number(cart.bill) - Number(productItem.quantity) * Number(productItem.price);
                    cart.totalquantity = Number(cart.totalquantity) - Number(productItem.quantity)
                    cart.items.splice(itemIndex, 1);
                }
                cart.save();
                resolve({ Status: true })
            }
            catch (err) {
                resolve(err)
            }


        })
    },

    addwishlist: (productId, userId) => {

        return new Promise(async (resolve, reject) => {
            let Status = {
                addwishlist: false
            }
            try {

                let cart = await wishlist_collection.findOne({ userId });
                let item = await Product_collection.findOne({ _id: productId });
                if (!item) {
                }
                const price = item.price;
                const name = item.title;
                const images = item.Images

                if (cart) {
                    // if cart exists for the user
                    let itemIndex = cart.items.findIndex(p => p.productId == productId);

                    // Check if product exists or not
                    if (itemIndex > -1) {
                        resolve(Status)
                    }
                    else {
                        cart.items.push({ productId, images, name, price });
                    }
                    cart.save();
                    Status.addwishlist = true
                    resolve(Status)
                }
                else {
                    // no cart exists, create one
                    const newCart = await wishlist_collection.create({
                        userId,
                        items: [{ productId, images, name, price }],
                    });
                    Status.addwishlist = true
                    resolve(Status)
                }
            }
            catch (err) {
                resolve(err)

            }


        })
    },
    getwishlistpage: (userId) => {

        return new Promise(async (resolve, reject) => {
            try {

                let response = {
                    wishlist: null,
                    wishlistisnot: true
                }
                let wishlistproduct = await wishlist_collection.findOne({ userId });
                if (wishlistproduct) {
                    response.wishlistisnot = false
                    response.wishlist = wishlistproduct
                    resolve(response)
                } else {
                    response.wishlistisnot = true
                    resolve(response)
                }
            } catch (err) {
                resolve(err)

            }
        })
    },
    wishlistProductDelete: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let wishlist = await wishlist_collection.findOne({ userId: userId });
                let itemIndex = wishlist.items.findIndex(p => p.productId == productId);

                if (itemIndex > -1) {
                    wishlist.items.splice(itemIndex, 1);
                }
                wishlist = await wishlist.save();
                resolve({ Status: true })
            }
            catch (err) {
                resolve(err)

            }



        })
    },

    //user add adress
    addAdress: (userId, addres) => {
        return new Promise(async (resolve, reject) => {
            try {

                useraddress = await address_collection.find({ userId: userId })

                if (useraddress.length > 0) {
                    useraddress[0].adress.push({
                        Name: addres.Name,
                        PhoneNo: addres.phoneNo,
                        Address: addres.Address,
                        city: addres.city,
                        state: addres.State,
                        localAddres: addres.LocalAddress,
                        zip: addres.Zip,
                        Payment: addres.gridRadios
                    });
                    useraddress[0].save();


                } else {
                    const newAddress = await address_collection.create({
                        userId,
                        adress: [{
                            Name: addres.Name,
                            PhoneNo: addres.phoneNo,
                            Address: addres.Address,
                            city: addres.city,
                            state: addres.State,
                            localAddres: addres.LocalAddress,
                            zip: addres.Zip,
                            Payment: addres.gridRadios
                        }],
                    });

                }
                await user_collection.findByIdAndUpdate(userId._id, {
                    userdetails: {
                        Name: addres.Name,
                        PhoneNo: addres.phoneNo,
                        Address: addres.Address,
                        city: addres.city,
                        state: addres.State,
                        localAddres: addres.LocalAddress,
                        zip: addres.Zip,
                        Payment: addres.gridRadios
                    }
                })
                resolve({ Status: true })
            } catch (err) {
                resolve(err)

            }
        })
    },
    getUserAddres: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let response = {
                    data: null
                }
                user = await user_collection.findById(userId._id)
                if (user) {
                    response.data = user
                    resolve(response)
                } else {
                    resolve(response)
                }
            } catch (err) {
                resolve(err)

            }
        })
    },
    Checkout: (userId, Coupon) => {
        return new Promise(async (resolve, reject) => {
            try {

                let response = {
                    Status: true,
                    PaymentMethod: null,
                    orderID: null,
                    Bill: null,
                    message: null,
                }
                let Bill
                let today = new Date()
                let date = new Date().toJSON().slice(0, 10);
                let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                let cart = await cart_Collection.findOne({ userId });
                let user = await user_collection.findById(userId)
                let order = await order_collection.findOne({ userId });
                if (cart) {
                    if (user.userdetails.Address && user.userdetails.Payment) {
                        if (Coupon) {
                            Bill = parseInt(Number(cart.bill) - Number(cart.bill) * Number(Coupon.discount) / 100)
                        } else {
                            Bill = cart.bill

                        }
                        userdetails = user.userdetails
                        products = cart.items
                        response.PaymentMethod = user.userdetails.Payment
                        if (900000 > Bill) {
                            if (cart) {
                                if (order) {
                                    order.orders.push({
                                        date: date,
                                        time: time,
                                        orderStatus: "pending",
                                        userdetails: userdetails,
                                        totalprice: Bill,
                                        product: products
                                    })
                                    order.save((err, data) => {
                                        cart_Collection.deleteOne({ userId: userId }).then((data) => {
                                        })
                                        v = data.orders.length
                                        response.Status = false
                                        response.orderID = data.orders[v - 1]._id
                                        response.Bill = Bill
                                        resolve(response)

                                    })
                                } else {
                                    order_collection.create({
                                        userId: userId,
                                        orders: [{
                                            date: date,
                                            time: time,
                                            orderStatus: "pending",
                                            userdetails: userdetails,
                                            totalprice: Bill,
                                            product: products
                                        }],

                                    }, (err, data) => {
                                        cart_Collection.deleteOne({ userId: userId }).then((data) => {
                                        })
                                        response.Status = false
                                        response.orderID = data.orders[0]._id
                                        response.Bill = Bill
                                        resolve(response)
                                    })


                                }
                            } else {
                                response.Status = true
                                response.message = "please add product in cart"
                                resolve(response)
                            }
                        } else {

                            response.Status = true
                            response.message = "Total price minimum 900000"
                            resolve(response)
                        }
                    } else {
                        response.Status = true
                        response.message = "please fill Address form"
                        resolve(response)
                    }
                } else {
                    response.Status = true
                    response.message = "please add product in cart"
                    resolve(response)
                }
            } catch (err) {
                resolve(err)

            }
        })

    },
    generateRazorpay: (orderID, totalprice) => {

        return new Promise((resolve, reject) => {
            try {
                var options = {
                    amount: totalprice * 100,
                    currency: "INR",
                    receipt: "" + orderID,

                }
                instance.orders.create(options, function (err, order) {

                    resolve(order)
                })
            } catch (err) {
                resolve(err)

            }
        })

    },
    getuseraddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let adress = await address_collection.find({ userId: userId })
                resolve(adress)
            } catch (err) {
                resolve(err)

            }
        })
    },
    orderslist: (user) => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await order_collection.findOne({ userId: user });
                if (order) {
                    orders = order.orders.reverse()
                    resolve(orders)

                }

                resolve(order)
            } catch (err) {
                resolve(err)

            }
        })

    },
    verifypayment: (details) => {
        return new Promise((resolve, reject) => {
            try {
                let hmac = crypto.createHmac('sha256', 'W860tU8G6jjmMpkpG6DI0E80')
                hmac.update(details['Payment[razorpay_order_id]'] + '|' + details['Payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')
                if (hmac == details['Payment[razorpay_signature]']) {
                    resolve()
                } else {
                    reject()
                }
            } catch (err) {
                resolve(err)

            }
        })
    },
    chagepaymentStatus: (oderId, userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                let order = await order_collection.findOne({ userId: userId });
                if (order) {
                    let itemIndex = order.orders.findIndex(p => p._id == oderId);
                    if (itemIndex > -1) {
                        let productItem = order.orders[itemIndex];
                        productItem.orderStatus = "placed"
                        order.orders[itemIndex] = productItem;
                        order.save();
                    }
                    resolve({ Status: true })
                }
            } catch (err) {
                resolve(err)

            }
        })
    },
    getcartcount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cart = {
                    cartcount: 0,
                    usercart: null
                }
                let data = await cart_Collection.findOne({ userId: userId });
                if (data) {
                    cart.usercart = data
                    cart.cartcount = data.items.length

                } else {
                    cartcount = 0
                }
                resolve(cart)
            } catch (err) {
                resolve(err)

            }
        })

    },
    getwishlistcount: (userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                let wishlists = {
                    wishlistcount: 0,
                    userwishlist: null
                }
                let wishlist = await wishlist_collection.findOne({ userId: userId });
                let wishlistcount;
                if (wishlist) {
                    wishlists.userwishlist = wishlist
                    wishlists.wishlistcount = wishlist.items.length

                } else {
                    wishlistcount = 0
                }
                resolve(wishlists)
            } catch (err) {
                resolve(err)

            }
        })

    }
    ,
    getMyAccount: (user) => {
        return new Promise(async (resolve, reject) => {
            try {
                user = user_collection.findOne({ Email: user });
                resolve(user)
            } catch (err) {
                resolve(err)

            }
        })
    },
    ordersProductlist: (userID, orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await order_collection.findOne({ userId: userID });
                let itemIndex = order.orders.findIndex(p => p._id == orderId);

                if (itemIndex > -1) {
                    let productItem = order.orders[itemIndex];
                    resolve(productItem)

                }
            } catch (err) {
                resolve(err)

            }
        })
    },
    cancelOrder: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await order_collection.findOne({ userId: userId });
                let itemIndex = order.orders.findIndex(p => p._id == orderId);
                if (itemIndex > -1) {
                    let productItem = order.orders[itemIndex];
                    productItem.orderStatus = "canceled"
                    order.orders[itemIndex] = productItem;
                    order.save();
                }
                resolve({ Status: true })
            } catch (err) {
                resolve(err)

            }
        })
    },
    ApplyCoupon: (coupencode, userId, totalbill) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {
                    Status: false,
                    Message: null,
                    data: null
                }
                Coupon_colection.find({ Couponcode: coupencode }, (err, data1) => {
                    if (!err) {
                        if (data1.length !== 0) {
                            user_collection.findOne({ _id: userId }, (err, data2) => {
                                if (!err) {
                                    if (data2.length !== 0) {
                                        let itemIndex = data2.Coupons.findIndex(p => p._id == data1[0]._id);
                                        if (itemIndex == -1) {
                                            let date = new Date().toJSON().slice(0, 10);
                                            if (date < data1[0].expdate) {
                                                if (totalbill < data1[0].maxlimite) {

                                                    if (Number(data1[0].minpurchase) < Number(totalbill)) {
                                                        response.data = data1
                                                        response.Status = true
                                                        resolve(response)
                                                    } else {
                                                        response.Message = "!please cheak your cart your Coupon minpurchase !" + data1[0].minpurchase
                                                        response.Status = false
                                                        resolve(response)
                                                    }

                                                } else {
                                                    response.Message = "!please cheak your cart your Coupon maxlimite !" + data1[0].maxlimite
                                                    response.Status = false
                                                    resolve(response)
                                                }
                                            } else {
                                                response.Message = "!this coupon date expired!"
                                                response.Status = false
                                                resolve(response)

                                            }

                                        } else {
                                            response.Message = "! your already used this coupon!"
                                            response.Status = false
                                            resolve(response)
                                        }
                                    } else {
                                        response.Message = "!please first go to in login!"
                                        response.Status = false
                                        resolve(response)

                                    }
                                } else {
                                    response.Message = "!please cheak Coupon code !"
                                    response.Status = false
                                    resolve(response)
                                }

                            })




                        } else {
                            response.Message = "! Coupon code wrong!"
                            response.Status = false
                            resolve(response)
                        }

                    } else {
                        response.Message = "! Coupon code wrong!"
                        response.Status = false
                        resolve(response)

                    }
                })
            } catch (err) {
                resolve(err)

            }
        })
    },
    saveUseCoupon: (userId, couponId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await user_collection.findOne({ _id: userId })
                user.Coupons.push({ couponId: couponId })
                user.save().then((data) => {
                })
                resolve({ Status: true })
            } catch (err) {
                resolve(err)

            }
        })
    },
    getbanner: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let banner = await banner_collection.find()
                resolve(banner)
            } catch (err) {
                resolve(err)

            }
        })
    },
    pricesort: (first, second) => {
        return new Promise(async (resolve, reject) => {
            try {
                product = await Product_collection.find({ price: { $gt: first, $lt: second } })
                resolve(product)
            } catch (err) {
                resolve(err)

            }
        })
    },

    selectAddress: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                useraddress = await address_collection.find({ userId: userId })
                let adressIndex = useraddress[0].adress.findIndex(p => p._id == orderId);

                if (adressIndex > 0) {
                    addres = useraddress[0].adress[adressIndex]

                    await user_collection.findByIdAndUpdate(userId, {
                        userdetails: {
                            Name: addres.Name,
                            PhoneNo: addres.PhoneNo,
                            Address: addres.Address,
                            city: addres.city,
                            state: addres.state,
                            localAddres: addres.localAddres,
                            zip: addres.zip,
                            Payment: addres.Payment
                        }
                    })
                    resolve({ Status: true })
                } else {
                    resolve({ Status: false })

                }
            } catch (err) {
                resolve(err)

            }
        })
    },
    messageuser: (Message) => {
        return new Promise(async (resolve, reject) => {
            try {

                let date = new Date().toJSON().slice(0, 10);
                const message = new message_collection({
                    Email: Message.messageEmail,
                    message: Message.message,
                    date: date
                })
                message.save()
                resolve()
            } catch (err) {
                resolve(err)

            }
        })

    },
    deleteAddress: (AddressId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let address = await address_collection.findOne({ userId: userId });
                let itemIndex = address.adress.findIndex(p => p._id == AddressId);
                if (itemIndex > -1) {
                    address.adress.splice(itemIndex, 1);
                }
                address = await address.save();
                resolve({ Status: true })
            }
            catch (err) {
                resolve(err)

            }



        })
    },
    editAddress: (AddressId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let address = await address_collection.findOne({ userId: userId });
                let itemIndex = address.adress.findIndex(p => p._id == AddressId);
                if (itemIndex > -1) {
                    resolve(address.adress[itemIndex])

                }
            }
            catch (err) {
                resolve(err)

            }



        })
    },
    postEditAddress: (Address, AddressId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let address = await address_collection.findOne({ userId: userId });
                let itemIndex = address.adress.findIndex(p => p._id == AddressId);
                if (itemIndex > -1) {
                    let addresstItem = address.adress[itemIndex];
                    addresstItem.Name = Address.Name
                    addresstItem.PhoneNo = Address.phoneNo
                    addresstItem.Address = Address.Address
                    addresstItem.city = Address.city
                    addresstItem.state = Address.State
                    addresstItem.localAddres = Address.LocalAddress
                    addresstItem.zip = Address.Zip
                    addresstItem.Payment = Address.gridRadios
                    address.adress[itemIndex] = addresstItem;
                    address.save();
                    resolve()
                }
            }
            catch (err) {
                resolve(err)

            }



        })
    },
    homepages: (pegeNo, perpage) => {


        return new Promise(async (resolve, reject) => {
            try {
                let product = {
                    productcount: 0,
                    products: null
                }
                product.productcount = await Product_collection.find().count()
                product.products = await Product_collection.find().skip((pegeNo - 1) * perpage).limit(perpage)
                resolve(product)
            }
            catch (err) {
                resolve(err)

            }
        })

    },
    forgotPassword: (useremail) => {


        return new Promise(async (resolve, reject) => {
            try {
                let response = {
                    Status: false,
                    data: null
                }
                let findUser = await user_collection.find({ Email: useremail.email })
                if (findUser.length > 0) {
                    response.Status = true
                    response.data = findUser[0].PhoneNo
                    resolve(response)
                } else {
                    response.Status = false
                    resolve(response)
                }
            }
            catch (err) {
                resolve(err)

            }
        })
    },
    updatePassword: (Password, email) => {

        return new Promise(async (resolve, reject) => {
            try {
                Password.Password = await bcrypt.hash(Password.Password, 10)

                user_collection.updateOne({ Email: email }, {
                    $set: {
                        Password: Password.Password
                    }
                }).then((data) => {
                    if (data) {
                        resolve({ Status: true })

                    } else {
                        resolve({ Status: false })
                    }

                })
            }
            catch (err) {
                resolve(err)


            }
        })
    },
    editMydetails: (userId) => {

        return new Promise(async (resolve, reject) => {
            try {

                let findUser = await user_collection.find({ _id: userId })
                if (findUser.length > 0) {
                    resolve(findUser)

                } else {
                    resolve(err)
                }
            }
            catch (err) {
                resolve(err)


            }
        })

    },
    postEditMyDetails: (userdetails, userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                user_collection.updateOne({ _id: userId }, {
                    $set: {
                        Name: userdetails.Name,
                        Email: userdetails.Email

                    }
                }).then((data) => {
                    if (data) {
                        resolve({ Status: true })

                    } else {
                        resolve({ Status: false })
                    }

                })
            }
            catch (err) {
                resolve(err)


            }
        })
    },
    DownloadBill: (userId, orderID) => {
        return new Promise(async (resolve, reject) => {
            try {
              order= await order_collection.findOne({userId:userId})
              let itemIndex = order.orders.findIndex(p => p._id == orderID);
              if (itemIndex > -1) {
                let orderItem = order.orders[itemIndex];
                resolve(orderItem)
              }else{
                resolve()
              }
                
            }
            catch (err) {
                resolve(err)


            }
        })

        }

}

