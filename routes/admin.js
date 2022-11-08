var express = require('express');
var router = express.Router();
const adminController=require('../Controller/admin');
const { AddProduct } = require('../helpers/product_helpers');
const middleware=require('../Controller/middleware')


/* GET home page. */
router.get('/',middleware.adminsessioncheck,adminController.gethomepage);

//get home page
router.get('/admin_home',middleware.adminsessioncheck,adminController.gethomepage)

//get user details
router.get('/admin_userlist',middleware.adminsessioncheck,adminController.getuserdetails)

//get products list 
router.get('/admin_productlist',middleware.adminsessioncheck,adminController.getallProducts)

//delete products
router.get('/delete-product/:id',middleware.adminsessioncheck,adminController.deleteproducts)

// get edit product details
router.get('/edit-product/:id',middleware.adminsessioncheck,adminController.GetEditProduct)

// post edit product
router.post('/admin_edit-product/:id',middleware.adminsessioncheck,middleware.productImages().array("img",3),adminController.PostEditProduct)

// get add product page
router.get('/Addproduct',middleware.adminsessioncheck,adminController.GetAddProduct)

//post add product
router.post('/Add-product',middleware.adminsessioncheck,middleware.productImages().array("img",3), adminController.PostAddProduct)

//get user blocking 
router.get('/admin_userBlock/:id',middleware.adminsessioncheck,adminController.userBlock)

//get user unblocking
router.get('/admin_UserUnBlock/:id',middleware.adminsessioncheck,adminController.UserUnblocking)

//get admin login
router.get('/admin_login',adminController.getadminlogin)

//post admin login 
router.post('/admin_login',adminController.postadminlogin)

//get Categorylist page
router.get('/admin_Categorylist',middleware.adminsessioncheck,adminController.getCategorylist)

//add AddCategory
router.post('/AddCategory',middleware.adminsessioncheck,adminController.postAddCategory)

//delete Category
router.get('/delete-Category/:Category',middleware.adminsessioncheck,adminController.deleteCategory)

//Category-products
router.get('/Category-products/:Category',middleware.adminsessioncheck,adminController.getCategoryproducts)

//admin logout
router.get('/adminlogout',middleware.adminsessioncheck,adminController.adminlogout) 

// admin oderslis
router.get('/admin-oderslis',middleware.adminsessioncheck,adminController.adminOderslis)

//admin get oders products
router.get('/adminGetOdersProduct/:id',middleware.adminsessioncheck,adminController.GetOdersProduct)

//get Online Payments
router.get('/payments-oderslist/:Payment',middleware.adminsessioncheck,adminController.oderPaymentproduct)

//get cancel-orders
router.get('/cancel-order/:Status',middleware.adminsessioncheck,adminController.getCancelOrder)

//get /Sales Report
router.get("/SalesReport",middleware.adminsessioncheck,adminController.salesReport)

//get Coupon Page
router.get('/getCouponPage',middleware.adminsessioncheck,adminController.getCouponPage)

///add new Coupon
router.route('/admin-addCoupon')
    .get(middleware.adminsessioncheck,adminController.addCoupon)
    .post(middleware.adminsessioncheck,adminController.postaddCoupon)

router.get("/expired-oderslist",adminController.expiredOderslist)

//edit coupon
router.route('/admin-editeCoupon/:id')
    .get(middleware.adminsessioncheck,adminController.adminEditeCoupon)
    .post(middleware.adminsessioncheck,adminController.postEditeCoupon)

/// admin delete Coupon
router.get('/admin-deleteCoupon/:id/:change',middleware.adminsessioncheck,adminController.adminDeleteCoupon)

//get delete Coupon
router.get('/admin-DeleteCoupon',middleware.adminsessioncheck,adminController.DeleteCouponPage)

///get Banners page
router.get('/getBanners',middleware.adminsessioncheck,adminController.getBanners)

//get banner more...
router.get('/banner-more/:id',middleware.adminsessioncheck,adminController.bannerMore)

///edit-banner
router.get('/edit-banner/:id/:insideId',middleware.adminsessioncheck,adminController.editBanner)

///edit-banner
router.post('/edit-banner',middleware.adminsessioncheck,middleware.bannerimages().array("img",1),adminController.posteditBanner)

///change oders Status
router.get('/changeStatus/:status/:orderID/:insideorderId',middleware.adminsessioncheck,adminController.changeStatus)

router.post('/edit-Footer',middleware.adminsessioncheck,adminController.editFooter)

router.get('/Messages',middleware.adminsessioncheck,adminController.Messages)

//get one message
router.get('/getOneMessage/:id',middleware.adminsessioncheck,adminController.getOneMessage)

///post edit-contact
router.post('/edit-contact',middleware.adminsessioncheck,adminController.editcontact)

//err page
router.get('/err',adminController.errpage)
/* For Admin Error Page */
router.use(function (req, res, next) {
    next(createError(404));
  });
  
  router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('admin_pages/admin-404');
  });

module.exports = router;
