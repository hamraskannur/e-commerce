const express = require('express');
const router = express.Router();
const UserController = require('../Controller/user')
const middleware=require('../Controller/middleware');
const { route } = require('./admin');

/* GET users listing. */
router.get('/', UserController.UserHome);

//  get and post user signup
router.route('/signup')
    .get(UserController.getuserSignup)
    .post(UserController.postusersignup)


//  get user login
router.route('/login')
    .get(UserController.getuserlogin)
    .post( UserController.postuserlogin)


router.post("/postotp",UserController.postOtp)

//  get user logout
router.get('/logout', UserController.Userlogout)

//  get user userhomepage
router.get('/userhome',UserController.getuserhome)

//  get user cart
router.get('/viewcartmycart',middleware.sessioncheck,middleware.verifyactive,UserController.getusercart)

//  get All product page
router.get('/product', UserController.getAllproduct)

//addtocart
router.post('/addproducts/:id', UserController.getAddToCart)

//get one product
router.get("/viewsOneproduct/:id", UserController.getOneproduct)

//get user side category 
router.get('/getcategory/:category', UserController.getcategory)

//add to cart one products
router.get('/addtocart/:id', UserController.AddToCart)

//cart +incrment quantity
router.post('/cartquantityinc/:id',middleware.sessioncheck,middleware.verifyactive,UserController.cartquantityinc)

//cart -decrment quantity
router.post('/cartquantitydec/:id',middleware.sessioncheck,middleware.verifyactive,UserController.cartquantitydec)

//add to wishlist
router.get('/addtowishlist/:id',UserController.addtowishlist)

///get wishlist page
router.get("/getwishlistpage",middleware.sessioncheck,middleware.verifyactive,UserController.getwishlistpage)

//delete cart products
router.get('/cart-delete-products/:id', UserController.cartDeleteProducts)

//wishlist-product-delete
router.get('/wishlist-product-delete/:id',middleware.sessioncheck,middleware.verifyactive,UserController.wishlistProductDelete)

// get checkout Address page
router.get('/checkoutAddress',middleware.sessioncheck,middleware.verifyactive,UserController.checkoutAddress)

//Add Address
router.post('/addAdress',middleware.sessioncheck,middleware.verifyactive,UserController.addAdress)

//user click Checkout
router.post('/Checkout',middleware.sessioncheck,middleware.verifyactive,UserController.Checkout)

///order-success page
router.get('/order-success',middleware.sessioncheck,middleware.verifyactive,UserController.orderSuccess)

// get home in order-success page
router.get('/gethome',UserController.gethome)

// get order list
router.get('/orderslist',middleware.sessioncheck,middleware.verifyactive, UserController.orderslist)

///verifypayment
router.post('/verifypayment',UserController.verifypayment)

//get user my account
router.get('/getMyAccount',middleware.sessioncheck,middleware.verifyactive,UserController.getMyAccount)

//get Orders Product
router.get('/getOrdersProduct/:id',UserController.getOdersProduct)

///user cancel order
router.get('/cancel-order/:id',middleware.sessioncheck,middleware.verifyactive,UserController.cancelOrder)

///get popup cart
router.get('/getpopupcart/',UserController.getPopupCart)

/// Apply Coupon
router.post('/ApplyCoupon/',middleware.sessioncheck,middleware.verifyactive,UserController.getApplyCoupon)

//price sort in Category
router.post('/priceSortCategory/',UserController.priceSortCategory)

///select Address
router.get('/selectAddress/:id',middleware.sessioncheck,middleware.verifyactive,UserController.selectAddress)

//get Contact page
router.get('/Contact',UserController.Contact)

//sent message
router.post('/messageuser',UserController.messageuser)

//My Search
router.get('/MySearch/:input',UserController.MySearch)

router.get('/err',UserController.err)

//delete address 
router.get('/deleteAddress/:id',middleware.sessioncheck,middleware.verifyactive,UserController.deleteAddress)

//edit address
router.route('/editAddress/:id')
    .get(middleware.sessioncheck,middleware.verifyactive,UserController.editAddress)
    .post(middleware.sessioncheck,middleware.verifyactive,UserController.postEditAddress)
//pagenation
router.get('/page/:page',UserController.homepage)
router.get('/productpage/:page',UserController.productpage)

//forgot password
router.post('/forgotPassword',UserController.forgotPassword)

//get otp page for forgotpassword
router.get('/getopt/:phoneno',UserController.getopt)

router.post('/forgotPasswordotp/:phoneno',UserController.forgotPasswordotp)

router.post('/forgotPasswordpost',UserController.forgotPasswordpost)

router.route('/editMydetails')
    .get(middleware.sessioncheck,middleware.verifyactive,UserController.editMydetails)
    .post(middleware.sessioncheck,middleware.verifyactive, UserController.postEditMyDetails)

router.get('/DownloadBill/:id',middleware.sessioncheck,middleware.verifyactive,UserController.DownloadBill)

module.exports = router;

