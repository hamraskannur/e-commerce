const User_Helpers = require('../helpers/user_helpers')
const Product_Helpers = require('../helpers/product_helpers');
const e = require('express');
const { count } = require('../models/Schema/product_Schema');
const Coupon_schema = require('../models/Schema/Coupon_schema');
require('dotenv').config()


let signuperr = null;
let loginErr = null;
let login = 'false'
let cartcount = 0
let wishlistcount = 0
let usercart = null
let Categorydetails = null
let Categorysub = null
let wishlist = null
let banner = null
let Checkouterrmes = null



const accountSid = process.env.Twilio_Accountsid;
const authToken = process.env.Twilio_Authtoken;
const verifySid = process.env.Twilio_Verifysid;

const client = require('twilio')(accountSid, authToken);





//get user home page
exports.UserHome = (req, res, next) => {
    //get all products 
    if (req.session.userlogin) {
        userId = req.session.user
        Product_Helpers.GetAllproduct().then((products) => {
            Product_Helpers.GetAllCategory().then((Category) => {
                Categorydetails = Category
                Categorysub = Category
                User_Helpers.getcartcount(userId).then((cart) => {
                    cartcount = cart.cartcount
                    usercart = cart.usercart
                    User_Helpers.getwishlistcount(userId).then((wishlists) => {
                        wishlistcount = wishlists.wishlistcount
                        wishlist = wishlists.userwishlist
                        User_Helpers.getbanner().then((newbanner) => {
                            banner = newbanner
                            res.render('user/user_home', { login, products, Categorydetails, cartcount, wishlistcount, usercart, banner, Categorysub, wishlist });
                        })
                    })
                })
            })
        })
    } else {
        Product_Helpers.GetAllproduct().then((products) => {
            Product_Helpers.GetAllCategory().then((Category) => {
                Categorydetails = Category
                Categorysub = Category
                User_Helpers.getbanner().then((newbanner) => {
                    banner = newbanner

                    res.render('user/user_home', { login, products, Categorydetails, cartcount, wishlistcount, usercart, banner, Categorysub, wishlist });
                })
            })
        })
    }
}


//user get signup
exports.getuserSignup = (req, res) => {
    if (req.session.userlogin) {
        res.redirect('/')
    } else {
        res.render('user/user_signup', { signuperr, login, cartcount, wishlistcount, usercart, Categorydetails, banner })
    }
    signuperr = null

}

//user post signup
exports.postusersignup = (req, res) => {
    req.session.otp = req.body
    userphone = req.body.PhoneNo

    client.verify.v2.services(verifySid)
        .verifications
        .create({ to: '+91' + userphone, channel: 'sms' })
        .then(verification => console.log(verification.status));
    res.render('user/user-otp', { userphone, login, cartcount, wishlistcount, usercart, usercart, Categorydetails, banner })
}
exports.postOtp = (req, res) => {
    otperr = null
    console.log(req.body.otpnumber);
    let phoneno = req.session.otp.PhoneNo
    client.verify.v2.services(verifySid)
        .verificationChecks
        .create({ to: '+91' + phoneno, code: req.body.otpnumber })
        .then(verification_check => {
            console.log(verification_check.status)
            if (verification_check.status === "approved") {
                User_Helpers.DoSignup(req.session.otp).then((Status) => {
                    if (Status.userExist) {
                        signuperr = "! Email already difined !"
                        res.redirect('/signup')
                    } else {
                        req.session.user = Status
                        req.session.userlogin = true;
                        login = "true"
                        res.redirect('/')
                    }
                })
            } else {
                signuperr = 'Entered otp wrong please try again'
                res.redirect('/signup')
            }

        });

}

//get user login page
exports.getuserlogin = (req, res) => {
    if (req.session.userlogin) {
        res.redirect('/')
    } else {
        res.render('user/user_login', { loginErr, login, cartcount, wishlistcount, usercart, usercart, Categorydetails, banner })
    }
    loginErr = null
}

//post user login page
exports.postuserlogin = (req, res) => {

    User_Helpers.Dologin(req.body).then((response) => {
        if (response.Status) {
            req.session.user = response.user
            req.session.userlogin = true;
            login = "true"
            res.json(response)
        } else {
            res.json(response)

        }
    })

}

// get user logout
exports.Userlogout = (req, res) => {
    wishlistcount = 0
    cartcount = 0
    req.session.user = null
    req.session.userlogin = false
    login = 'null'
    res.redirect('/')
}

// get user home page with /userhome
exports.getuserhome = (req, res) => {
    res.redirect('/')

}

//get user cart
exports.getusercart = (req, res) => {
    userId = req.session.user
    User_Helpers.getcartproduct(userId).then((data) => {
        User_Helpers.getUserAddres(userId).then((response) => {
            Addres = response.data
            res.render('user/user_cart', { login, data, Addres, cartcount, wishlistcount, usercart, usercart, Categorydetails, banner, Checkouterrmes });
        })

    })
    Checkouterrmes = null

}

//user get all products in product page

exports.getAllproduct = (req, res) => {
    Product_Helpers.GetAllproduct().then((products) => {
        if (req.session.userlogin) {
            userid = req.session.user._id
            userId = req.session.user
            Product_Helpers.GetAllproduct().then((products) => {
                Product_Helpers.GetAllCategory().then((Category) => {
                    Categorydetails = Category
                    Categorysub = Category
                    User_Helpers.getcartcount(userId).then((cart) => {
                        cartcount = cart.cartcount
                        usercart = cart.usercart
                        User_Helpers.getwishlistcount(userId).then((wishlists) => {
                            wishlistcount = wishlists.wishlistcount
                            wishlist = wishlists.userwishlist
                            User_Helpers.getbanner().then((newbanner) => {
                                banner = newbanner
                                res.render('user/user_product', { products, login, cartcount, wishlistcount, usercart, Categorydetails, Categorysub, usercart, Categorydetails, banner, wishlist })
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

            res.render('user/user_product', { products, login, cartcount, wishlistcount, usercart, Categorydetails, Categorysub, usercart, Categorydetails, banner, wishlist })

        })
    })
        }

    })


}

//add to cart
exports.getAddToCart = (req, res) => {
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
        res.redirect('/login')
    }
}

//get one products
exports.getOneproduct = (req, res) => {
    Product_Helpers.getOneProductDetails(req.params.id).then((product) => {
        console.log(product);
        Product_Helpers.Categoryproducts(product.category).then((response) => {
            console.log(response.data)
            categoryProduct = response.data
            res.render('user/user_product-detail', { categoryProduct, product, login, cartcount, wishlistcount, usercart, usercart, Categorydetails, banner })
        })
    })
}

//get user side category

exports.getcategory = (req, res) => {
    category = req.params.category
    Product_Helpers.Categoryproducts(category).then((response) => {
        products = response.data
        if (response.Status) {
            res.json(products)
        } else {
            res.json(products)
        }

    })
}



//add to cart onre products
exports.AddToCart = (req, res) => {
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
}

//cart + quantity increment
exports.cartquantityinc = (req, res) => {
    user = req.session.user
    User_Helpers.cartquantityinc(req.params.id, user).then(() => {
        res.json({ Status: true })
    })
}


//cart - quantity decrement
exports.cartquantitydec = (req, res) => {
    user = req.session.user
    User_Helpers.cartquantitydec(req.params.id, user).then(() => {
        res.json({ Status: true })
    })
}


exports.addtowishlist = (req, res) => {
    user = req.session.user
    if (req.session.userlogin) {
        User_Helpers.addwishlist(req.params.id, user).then((Status) => {
            if (Status.addwishlist) {
                wishlistcount = wishlistcount + 1
                res.json({ Status: true })
            } else {

                res.json({ Status: false })
            }
        })

    } else {
        res.json({ Status: false })

    }


}
exports.getwishlistpage = (req, res) => {
    if (req.session.userlogin) {
        user = req.session.user
        User_Helpers.getwishlistpage(user).then((response) => {
            if (response.wishlistisnot) {
                res.redirect('/')
            } else {
                wishlistproduct = response.wishlist
                wishlist = response.wishlist
                res.render('user/user_wishlist', { login, wishlist, cartcount, wishlistcount, usercart, usercart, Categorydetails, banner })
            }
        })
    } else {
        res.json({ Status: false })
    }
}

exports.cartDeleteProducts = (req, res) => {
    if (req.session.userlogin) {
        user = req.session.user
        User_Helpers.cartDeleteProducts(req.params.id, user).then(() => {
            res.json({ Status: true })
        })
    } else {
        res.json({ Status: false })
    }
}

exports.wishlistProductDelete = (req, res) => {
    if (req.session.userlogin) {
        user = req.session.user
        User_Helpers.wishlistProductDelete(req.params.id, user._id).then(() => {
            wishlistcount = wishlistcount - 1
            res.json({ Status: true })
        })
    } else {
        res.redirect('/login')
    }
}

exports.checkoutAddress = (req, res) => {
    if (req.session.userlogin) {
        user = req.session.user
        User_Helpers.getuseraddress(user._id).then((useraddress) => {
            console.log(useraddress);
            res.render("user/user_AddressPage", { useraddress, login, cartcount, wishlistcount, usercart, usercart, Categorydetails, banner })

        })
    } else {
        res.redirect('/login')

    }
}

exports.addAdress = (req, res) => {
    if (req.session.userlogin) {
        user = req.session.user
        User_Helpers.addAdress(user, req.body).then(() => {
            res.redirect('/viewcartmycart')
        })
    } else {
        res.redirect('/login')

    }
}

exports.Checkout = async (req, res) => {
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


                    User_Helpers.saveUseCoupon(user._id, Coupon._id).then(() => {
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
}


// get home page in orderSuccess page
exports.gethome = (req, res) => {
    res.redirect('/')
}

//get orderSuccess page
exports.orderSuccess = (req, res) => {
    res.render('user/payment-success', { login, cartcount, wishlistcount, usercart, usercart, Categorydetails, banner })
}

exports.orderslist = (req, res) => {
    user = req.session.user
    User_Helpers.orderslist(user._id).then((orders) => {
        res.render('user/user_orderslist', { orders, login, cartcount, wishlistcount, usercart, usercart, Categorydetails, banner })
    })

}

exports.verifypayment = (req, res) => {
    user = req.session.user
    User_Helpers.verifypayment(req.body).then(() => {
        User_Helpers.chagepaymentStatus(req.body['order[receipt]'], userId._id).then(() => {
            res.json({ paymentSuccess: true })
        })
    }).catch((err) => {
        console.log(err);
        res.json({ paymentSuccess: false })
    })
}

exports.getMyAccount = (req, res) => {
    user = req.session.user
    User_Helpers.getMyAccount(user.Email).then((userMyAccount) => {
        res.render('user/user_MyAccount', { login, cartcount, wishlistcount, userMyAccount, usercart, usercart, Categorydetails, banner })

    })
}

exports.getOdersProduct = (req, res) => {
    user = req.session.user
    id = req.params.id
    User_Helpers.ordersProductlist(user, id).then((order) => {
        res.render('user/oderlist-one-product', { login, cartcount, wishlistcount, order, usercart, usercart, Categorydetails, banner })
    })
}

exports.cancelOrder = (req, res) => {
    //order id
    id = req.params.id
    user = req.session.user
    User_Helpers.cancelOrder(id, user._id).then(() => {
        res.json({ Status: true })
    })

}


exports.getPopupCart = (req, res) => {
    if (req.session.userlogin) {
        userId = req.session.user
        User_Helpers.getcartproduct(userId).then((cartproducts) => {
            res.json(cartproducts)
        })
    }
}

exports.getApplyCoupon = (req, res) => {
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
}


exports.priceSortCategory = (req, res) => {
    first = req.body.first
    second = req.body.second
    User_Helpers.pricesort(first, second).then((product) => {
        res.json(product)
    })
}

exports.selectAddress = (req, res) => {
    user = req.session.user
    User_Helpers.selectAddress(req.params.id, user._id).then((Status) => {
        if (Status) {
            res.redirect('/viewcartmycart')
        } else {
            res.redirect('back')
        }
    })
}

exports.Contact = (req, res) => {
    res.render('user/user_contact-page', { login, wishlist, cartcount, wishlistcount, usercart, usercart, Categorydetails, banner })
}

exports.messageuser = (req, res) => {
    User_Helpers.messageuser(req.body).then(() => {
        res.redirect('/Contact')
    })
}

exports.MySearch = (req, res) => {
    Product_Helpers.MySearch(req.params.input).then((product) => {
        console.log(product);
        res.json(product)
    })
}

exports.err=(req,res)=>{
    res.render('error')
}