const User_Helpers = require('../helpers/user_helpers')
const Product_Helpers = require('../helpers/product_helpers');
const e = require('express');
const { count } = require('../models/Schema/product_Schema');
const Coupon_schema = require('../models/Schema/Coupon_schema');
const easyinvoice = require('easyinvoice')
const fs = require('fs')
require('dotenv').config()

let invoiceData = {
    "client": {
        "company": "Smart World",
        "address": "Street 456",
        "zip": "Zip code",
        "country": "Country Name"
    },

    "information": {
        // Invoice number
        "number": "2021.0001",
        // Invoice data
        "date": "12-12-2021",
    },
    "products": [],
    "settings": {
        "currency": "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
    },

};


let signuperr = null;
let loginErr = null;
let login = false
let cartcount = 0
let wishlistcount = 0
let usercart = null
let Categorydetails = null
let Categorysub = null
let wishlist = null
let banner = null
let Checkouterrmes = null
let perpage = 8
let pages = 0
let otperr = null
let forgotPassword = null
let errforgotPassword = null
const accountSid = process.env.Twilio_Accountsid;
const authToken = process.env.Twilio_Authtoken;
const verifySid = process.env.Twilio_Verifysid;
const client = require('twilio')(accountSid, authToken);





//get user home page
exports.UserHome = (req, res, next) => {
    //get all products 
    try {

        if (req.session.userlogin) {
            userId = req.session.user
            User_Helpers.homepages("1", perpage).then((productdetails) => {
                products = productdetails.products
                pages = Math.ceil(productdetails.productcount / perpage)
                Product_Helpers.GetAllCategory().then((Category) => {
                    Categorydetails = Category
                    Categorysub = Category
                    User_Helpers.getcartcount(userId).then((cart) => {
                        cartcount = cart.cartcount
                        req.session.cartproducts = cart.usercart
                        User_Helpers.getwishlistcount(userId).then((wishlists) => {
                            req.session.wishlistcount = wishlists.wishlistcount
                            req.session.wishlist = wishlists.userwishlist
                            User_Helpers.getbanner().then((newbanner) => {
                                banner = newbanner
                                res.render('user/user_home', { currentpage: "1", pages, login:req.session.userlogin, products, Categorydetails, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, banner, Categorysub, wishlist:req.session.wishlist });
                            })
                        })
                    })
                })
            })
        } else {
            User_Helpers.homepages("1", perpage).then((productdetails) => {
                products = productdetails.products
                pages = Math.ceil(productdetails.productcount / perpage)
                Product_Helpers.GetAllCategory().then((Category) => {
                    Categorydetails = Category
                    Categorysub = Category
                    User_Helpers.getbanner().then((newbanner) => {
                        banner = newbanner

                        res.render('user/user_home', { currentpage: "1", pages, login:req.session.userlogin, products, Categorydetails, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, banner, Categorysub, wishlist:req.session.wishlist });
                    })
                })
            })
        }
    } catch (err) {
        res.redirect('/err')
    }
}


//user get signup
exports.getuserSignup = (req, res) => {
    try {

        if (req.session.userlogin) {
            res.redirect('/')
        } else {
            res.render('user/user_signup', { signuperr, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
        }
        signuperr = null
    } catch (err) {
        res.redirect('/err')
    }
}

//user post signup
exports.postusersignup = (req, res) => {
    try {

        req.session.otp = req.body
        userphone = req.body.PhoneNo

        client.verify.v2.services(verifySid)
            .verifications
            .create({ to: '+91' + userphone, channel: 'sms' })
            .then(verification => console.log(verification.status));
        res.render('user/user-otp', { userphone, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
    } catch (err) {
        res.redirect('/err')
    }
}
exports.postOtp = (req, res) => {
    try {
        otperr = null
        let phoneno = req.session.otp.PhoneNo
        client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: '+91' + phoneno, code: req.body.otpnumber })
            .then(verification_check => {
                if (verification_check.status === "approved") {
                    User_Helpers.DoSignup(req.session.otp).then((Status) => {
                        if (Status.userExist) {
                            signuperr = "! Email already difined !"
                            res.redirect('/signup')
                        } else {
                            req.session.user = Status
                            req.session.userlogin = true;
                            login = req.session.userlogin
                            res.redirect('/')
                        }
                    })
                } else {
                    signuperr = 'Entered otp wrong please try again'
                    res.redirect('/signup')
                }

            });
    } catch (err) {
        res.redirect('/err')
    }

}

//get user login page
exports.getuserlogin = (req, res) => {
    try {
        if (req.session.userlogin) {
            res.redirect('/')
        } else {
            res.render('user/user_login', { errforgotPassword, forgotPassword, loginErr, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
        }
        loginErr = null
        forgotPassword = null
        errforgotPassword = null
    } catch (err) {
        res.redirect('/err')
    }
}

//post user login page
exports.postuserlogin = (req, res) => {
    try {
        User_Helpers.Dologin(req.body).then((response) => {
            if (response.Status) {
                req.session.user = response.user
                req.session.userlogin = true;
                res.json(response)
            } else {
                res.json(response)

            }
        })
    } catch (err) {
        res.redirect('/err')
    }
}

// get user logout
exports.Userlogout = (req, res) => {
    try {
        cartcount = 0
        req.session.user = null
        req.session.userlogin = false
        req.session.wishlist=null
        req.session.wishlistcount=null
        req.session.cartproducts=null
        login = false
        res.redirect('/')
    } catch (err) {
        res.redirect('/err')
    }
}

// get user home page with /userhome
exports.getuserhome = (req, res) => {
    try {
        res.redirect('/')
    } catch (err) {
        res.redirect('/err')
    }
}

//get user cart
exports.getusercart = (req, res) => {
    try {
        userId = req.session.user
        User_Helpers.getcartproduct(userId).then((data) => {
            User_Helpers.getUserAddres(userId).then((response) => {
                Addres = response.data
                res.render('user/user_cart', { login:req.session.userlogin, data, Addres, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner, Checkouterrmes });
            })

        })
        Checkouterrmes = null
    } catch (err) {
        res.redirect('/err')
    }
}

//user get all products in product page

exports.getAllproduct = (req, res) => {
    try {
        Product_Helpers.GetAllproduct().then((products) => {
            if (req.session.userlogin) {
                userid = req.session.user._id
                userId = req.session.user
                User_Helpers.homepages(req.params.page, perpage).then((productdetails) => {
                    products = productdetails.products
                    pages = Math.ceil(productdetails.productcount / perpage)
                    currentpage = req.params.page
                    Product_Helpers.GetAllCategory().then((Category) => {
                        Categorydetails = Category
                        Categorysub = Category
                        User_Helpers.getcartcount(userId).then((cart) => {
                            cartcount = cart.cartcount
                            req.session.cartproducts = cart.usercart
                            User_Helpers.getwishlistcount(userId).then((wishlists) => {
                                req.session.wishlistcount = wishlists.wishlistcount
                                wishlist = wishlists.userwishlist
                                User_Helpers.getbanner().then((newbanner) => {
                                    banner = newbanner
                                    res.render('user/user_product', { pages, currentpage: 1, products, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, Categorysub, usercart, Categorydetails, banner, wishlist:req.session.wishlist})
                                })
                            })
                        })
                    })
                })
            } else {
                Product_Helpers.GetAllCategory().then((Category) => {
                    Categorydetails = Category
                    Categorysub = Category
                    User_Helpers.getbanner().then((newbanner) => {
                        banner = newbanner

                        res.render('user/user_product', { pages, currentpage: 1, products, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, Categorysub, usercart, Categorydetails, banner, wishlist:req.session.wishlist })

                    })
                })
            }

        })

    } catch (err) {
        res.redirect('/err')
    }
}

//add to cart
exports.getAddToCart = (req, res) => {
    try {
        if (req.session.userlogin) {
            id = req.params.id
            let userId = req.session.user
            quantity = req.body.totalcartcount
            User_Helpers.AddToCart(id, quantity, userId).then((Status) => {
                if (Status.Addproduct) {
                    res.json({ Status: true })
                } else {
                    res.json({ Status: false })
                }
            })
        } else {
            res.json({ Status: false })

        }
    } catch (err) {
        res.redirect('/err')
    }
}

//get one products
exports.getOneproduct = (req, res) => {
    try {
        if (req.session.userlogin) {
            userId = req.session.user._id
            Product_Helpers.getOneProductDetails(req.params.id).then((oneproduct) => {
                Product_Helpers.Categoryproducts(oneproduct.category).then((response) => {
                    categoryProduct = response.data
                    product = oneproduct
                    User_Helpers.getwishlistcount(userId).then((wishlists) => {
                        wishlistcount = wishlists.wishlistcount
                        wishlist = wishlists.userwishlist
                        res.render('user/user_product-detail', { wishlist:req.session.wishlist, categoryProduct, product, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
                    })
                })
            })
        } else {
            Product_Helpers.getOneProductDetails(req.params.id).then((oneproduct) => {
                Product_Helpers.Categoryproducts(oneproduct.category).then((response) => {
                    categoryProduct = response.data
                    product = oneproduct

                    res.render('user/user_product-detail', { wishlist:req.session.wishlist, categoryProduct, product, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
                })
            })
        }

    } catch (err) {
        res.redirect('/err')
    }
}

//get user side category

exports.getcategory = (req, res) => {
    try {
        category = req.params.category
        Product_Helpers.Categoryproducts(category).then((response) => {
            products = response.data
            if (response.Status) {
                res.json(products)
            } else {
                res.json(products)
            }

        })
    } catch (err) {
        res.redirect('/err')
    }
}



//add to cart onre products
exports.AddToCart = (req, res) => {
    try {
        user = req.session.user
        if (req.session.userlogin) {
            User_Helpers.AddToCartOne(req.params.id, user._id).then((Status) => {
                if (Status.Addproduct) {
                    res.json({ Status: true })
                } else {

                    res.json({ Status: false })
                }
            })
        } else {
            res.json({ Status: false })

        }
    } catch (err) {
        res.redirect('/err')
    }
}

//cart + quantity increment
exports.cartquantityinc = (req, res) => {
    try {
        user = req.session.user
        User_Helpers.cartquantityinc(req.params.id, user).then((Status) => {
            res.json({ Status: true })
        })
    } catch (err) {
        res.redirect('/err')
    }
}


//cart - quantity decrement
exports.cartquantitydec = (req, res) => {
    try {
        user = req.session.user
        User_Helpers.cartquantitydec(req.params.id, user).then((Status) => {
            res.json({ Status: true })
        })
    } catch (err) {
        res.redirect('/err')
    }
}


exports.addtowishlist = (req, res) => {
    try {
        user = req.session.user
        if (req.session.userlogin) {
            User_Helpers.addwishlist(req.params.id, user).then((Status) => {
                if (Status.addwishlist) {
                    req.session.wishlistcount  = req.session.wishlistcount  + 1
                    res.json({ Status: true })
                } else {

                    res.json({ Status: false })
                }
            })

        } else {
            res.json({ Status: false })

        }
    } catch (err) {
        res.redirect('/err')
    }

}
exports.getwishlistpage = (req, res) => {
    try {
        if (req.session.userlogin) {
            user = req.session.user
            User_Helpers.getwishlistpage(user).then((response) => {
                if (response.wishlistisnot) {
                    res.redirect('/')
                } else {
                    wishlistproduct = response.wishlist
                    wishlist = response.wishlist
                    res.render('user/user_wishlist', { login:req.session.userlogin, wishlist, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
                }
            })
        } else {
            res.json({ Status: false })
        }
    } catch (err) {
        res.redirect('/err')
    }
}

exports.cartDeleteProducts = (req, res) => {
    try {
        if (req.session.userlogin) {
            user = req.session.user
            User_Helpers.cartDeleteProducts(req.params.id, user).then((Status) => {
                res.json({ Status: true })
            })
        } else {
            res.json({ Status: false })
        }
    } catch (err) {
        res.redirect('/err')
    }
}

exports.wishlistProductDelete = (req, res) => {
    try {
        if (req.session.userlogin) {
            user = req.session.user
            User_Helpers.wishlistProductDelete(req.params.id, user._id).then((Status) => {
                req.session.wishlistcount  = req.session.wishlistcount  - 1
                res.json({ Status: true })
            })
        } else {
            res.redirect('/login')
        }
    } catch (err) {
        res.redirect('/err')
    }
}

exports.checkoutAddress = (req, res) => {
    try {
        if (req.session.userlogin) {
            user = req.session.user
            User_Helpers.getuseraddress(user._id).then((useraddress) => {
                res.render("user/user_AddressPage", { useraddress, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
            })
        } else {
            res.redirect('/login')

        }
    } catch (err) {
        res.redirect('/err')
    }
}

exports.addAdress = (req, res) => {
    try {
        if (req.session.userlogin) {
            user = req.session.user
            User_Helpers.addAdress(user, req.body).then((Status) => {
                res.redirect('/viewcartmycart')
            })
        } else {
            res.redirect('/login')

        }
    } catch (err) {
        res.redirect('/err')
    }
}

exports.Checkout = async (req, res) => {
    try {
        if (req.session.userlogin) {
            user = req.session.user
            let Coupon = null;
            if (req.session.usercoupon) {
                Coupon = req.session.usercoupon
                await User_Helpers.Checkout(user._id, Coupon).then(async (response) => {
                    cartcount = 0
                    usercart = null
                    if (response.Status) {
                        res.json(response)
                    } else {
                        User_Helpers.saveUseCoupon(user._id, Coupon._id).then((Status) => {
                            req.session.usercoupon = null
                            if (response.PaymentMethod === "onlinePayment") {
                                orderID = response.orderID
                                Bill = response.Bill
                                User_Helpers.generateRazorpay(orderID, Bill).then((response) => {
                                    res.json(response)
                                })
                            } else if (response.PaymentMethod === "cashondelivery") {
                                orderID = response.orderID
                                user = req.session.user
                                res.json({ paymentSuccess: true })
                            } else {
                                res.redirect('/viewcartmycart')
                            }
                        })

                    }
                })
            } else {
                await User_Helpers.Checkout(user._id, Coupon).then(async (response) => {
                    cartcount = 0
                    usercart = null
                    if (response.Status) {
                        res.json(response)

                    } else {
                        if (response.PaymentMethod === "onlinePayment") {
                            orderID = response.orderID
                            Bill = response.Bill
                            User_Helpers.generateRazorpay(orderID, Bill).then((response) => {
                                res.json(response)
                            })
                        } else if (response.PaymentMethod === "cashondelivery") {
                            orderID = response.orderID
                            user = req.session.user


                            res.json({ paymentSuccess: true })

                        } else {
                            res.redirect('/viewcartmycart')
                        }
                    }
                })
            }
        } else {
            res.redirect('/login')
        }
    } catch (err) {
        res.redirect('/err')
    }
}


// get home page in orderSuccess page
exports.gethome = (req, res) => {
    try {
        res.redirect('/')
    } catch (err) {
        res.redirect('/err')
    }
}

//get orderSuccess page
exports.orderSuccess = (req, res) => {
    try {
        res.render('user/payment-success', { login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.orderslist = (req, res) => {
    try {
        user = req.session.user
        User_Helpers.orderslist(user._id).then((orders) => {
            res.render('user/user_orderslist', { orders, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.verifypayment = (req, res) => {
    try {
        user = req.session.user
        User_Helpers.verifypayment(req.body).then(() => {
            User_Helpers.chagepaymentStatus(req.body['order[receipt]'], userId._id).then((Status) => {
                res.json({ paymentSuccess: true })
            })
        }).catch((err) => {
            res.json({ paymentSuccess: false })
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.getMyAccount = (req, res) => {
    try {
        user = req.session.user
        User_Helpers.getMyAccount(user.Email).then((userMyAccount) => {
            res.render('user/user_MyAccount', { login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, userMyAccount, usercart: req.session.cartproducts, Categorydetails, banner })

        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.getOdersProduct = (req, res) => {
    try {
        user = req.session.user
        id = req.params.id
        User_Helpers.ordersProductlist(user, id).then((order) => {
            res.render('user/oderlist-one-product', { login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, order, usercart: req.session.cartproducts, Categorydetails, banner })
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.cancelOrder = (req, res) => {
    try {
        //order id
        id = req.params.id
        user = req.session.user
        User_Helpers.cancelOrder(id, user._id).then((Status) => {
            res.json({ Status: true })
        })
    } catch (err) {
        res.redirect('/err')
    }
}


exports.getPopupCart = (req, res) => {
    try {
        if (req.session.userlogin) {
            userId = req.session.user
            User_Helpers.getcartproduct(userId).then((cartproduct) => {
                req.session.cartproducts=cartproduct

                res.json({cartproducts:req.session.cartproducts})
            })
        }else{
            res.json({cartproducts:req.session.cartproducts})
        }
    } catch (err) {
        res.redirect('/err')
    }
}

exports.getApplyCoupon = (req, res) => {
    try {
        user = req.session.user
        ApplyCoupon = req.body.ApplyCoupon
        totalbill = req.body.totalbill
        User_Helpers.ApplyCoupon(ApplyCoupon, user._id, totalbill).then((response) => {
            Coupon = response.data
            if (response.Status) {
                req.session.usercoupon = Coupon[0]
                res.json(response)

            } else {
                res.json(response)
            }


        })
    } catch (err) {
        res.redirect('/err')
    }
}


exports.priceSortCategory = (req, res) => {
    try {
        first = req.body.first
        second = req.body.second
        User_Helpers.pricesort(first, second).then((product) => {
            res.json(product)
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.selectAddress = (req, res) => {
    try {
        user = req.session.user
        User_Helpers.selectAddress(req.params.id, user._id).then((Status) => {
            if (Status) {
                res.redirect('/viewcartmycart')
            } else {
                res.redirect('back')
            }
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.Contact = (req, res) => {
    try {
        
        res.render('user/user_contact-page', { login:req.session.userlogin, wishlist, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.messageuser = (req, res) => {
    try {
        User_Helpers.messageuser(req.body).then(() => {
            res.json({ Status: true })
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.MySearch = (req, res) => {
    try {
        Product_Helpers.MySearch(req.params.input).then((product) => {
            res.json(product)
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.err = (req, res) => {
    try {
        res.render('error')
    } catch (err) {
        res.redirect('/err')
    }
}

exports.deleteAddress = (req, res) => {
    try {
        userId = req.session.user._id
        User_Helpers.deleteAddress(req.params.id, userId).then((Status) => {
            res.json({ Status: true })
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.editAddress = (req, res) => {
    try {
        userId = req.session.user._id
        User_Helpers.editAddress(req.params.id, userId).then((Address) => {
            res.render('user/edite-Address', { Address, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })

        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.postEditAddress = (req, res) => {
    try {
        userId = req.session.user._id
        User_Helpers.postEditAddress(req.body, req.params.id, userId).then(() => {
            res.redirect('/checkoutAddress')
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.homepage = (req, res) => {
    try {
        User_Helpers.homepages(req.params.page, perpage).then((productdetails) => {
            products = productdetails.products
            pages = Math.ceil(productdetails.productcount / perpage)
            currentpage = req.params.page
            res.render('user/user_home', { currentpage, pages, login:req.session.userlogin, products, Categorydetails, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, banner, Categorysub, wishlist:req.session.wishlist});

        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.productpage = (req, res) => {
    try {
        User_Helpers.homepages(req.params.page, perpage).then((productdetails) => {
            products = productdetails.products
            pages = Math.ceil(productdetails.productcount / perpage)
            currentpage = req.params.page
            res.render('user/user_product', { pages, currentpage, products, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, Categorysub, usercart, Categorydetails, banner, wishlist:req.session.wishlist })

        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.forgotPassword = (req, res) => {
    try {
        req.session.forgotPassword = req.body.email
        User_Helpers.forgotPassword(req.body).then((response) => {
            if (response.Status) {
                client.verify.v2.services(verifySid)
                    .verifications
                    .create({ to: '+91' + response.data, channel: 'sms' })
                    .then(verification => console.log(verification.status));
                res.json(response)
            } else {
                res.json(response)
            }
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.getopt = (req, res) => {
    try {
        userphone = req.params.phoneno
        res.render('user/forgotPasswordOtp', { otperr, userphone, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.forgotPasswordotp = (req, res) => {
    try {
        phoneno = req.params.phoneno
        client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: '+91' + phoneno, code: req.body.otpnumber })
            .then(verification_check => {

                if (verification_check.status = "approved") {
                    res.render('user/forgotPasswordform', { otperr, userphone, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
                } else {
                    otperr = "your otp wrong"
                    res.redirect('/getopt/' + phoneno)
                }
            }
            )
    } catch (err) {
        res.redirect('/err')
    }
}

exports.forgotPasswordpost = (req, res) => {
    try {
        Password = req.body
        email = req.session.forgotPassword
        User_Helpers.updatePassword(Password, email).then((response) => {
            if (response.Status) {
                forgotPassword = "successfully changed password"
                res.redirect('/login')
            } else {
                res.redirect('/login')
                errforgotPassword = "your password not changed try again"
            }

        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.editMydetails = (req, res) => {
    try {
        userId = req.session.user._id
        User_Helpers.editMydetails(userId).then((userdetails) => {
            res.render('user/editMyAccount', { userdetails, login:req.session.userlogin, cartcount, wishlistcount:req.session.wishlistcount, usercart: req.session.cartproducts, Categorydetails, banner })
        })
    } catch (err) {
        res.redirect('/err')
    }
}


exports.postEditMyDetails = (req, res) => {
    try {
        userId = req.session.user._id
        req.session.user.Email = req.body.Email
        User_Helpers.postEditMyDetails(req.body, userId).then(() => {
            res.redirect('/getMyAccount')
        })
    } catch (err) {
        res.redirect('/err')
    }
}

exports.DownloadBill = (req, res) => {
    try {
        orderID = req.params.id
        userId = req.session.user._id
        User_Helpers.DownloadBill(userId, orderID).then((order) => {
            if(order){

                productsData=order.product
                invoiceData.products = []
                for (i of productsData) {
                    invoiceData.products.push({
                        "quantity": Number(i.quantity),
                        "description": i.name,
                        "price": Number(i.price),
                        "Total":Number(order.totalprice)
                    })
                }
                
                easyinvoice.createInvoice(invoiceData,async function (result) {
                    /*  
                        5.  The 'result' variable will contain our invoice as a base64 encoded PDF
                            Now let's save our invoice to our local filesystem so we can have a look!
                            We will be using the 'fs' library we imported above for this.
                    */
    
                    fs.writeFileSync("./public/invoice/invoice.pdf", result.pdf, 'base64');
                    await res.download('./public/invoice/invoice.pdf')
                })


            }
        })
    } catch (err) {
        res.redirect('/err')
    }
}