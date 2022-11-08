const Product_Helpers = require('../helpers/product_helpers')
const admin_Helpers = require('../helpers/admin_helpers');
const { EditProduct } = require('../helpers/product_helpers');
const { response } = require('../app');
var fs = require('fs');
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
let Categoryerr = null
let todayprice = [0]
let usercount = 0
let pendingproduct = 0
let cancelproduct = 0
let addCouponerr = null
let editCouponerr = ""
let bannerId = null


exports.gethomepage = (req, res,next) => {
  try {
    admin_Helpers.getDailySales().then((data) => {
      admin_Helpers.getDailyCancelOrder().then((cancelOrder) => {
        admin_Helpers.gettodaysellprice().then((result) => {
          todayprice = result.todaytotalprice
          usercount = result.usercount
          pendingproduct = result.pendingproduct
          cancelproduct = result.cancelproduct
          res.render('admin_pages/admin_home', { data, cancelOrder, todayprice, usercount, pendingproduct, cancelproduct, dashboard: true });


        })
      })

    })
  } catch (err) {
    next(err)
  }
}
// get admin login page
exports.getadminlogin = (req, res,next) => {
  try {
    if (req.session.adminlogin) {
      res.redirect('/admin')
    } else {
      res.render('admin_pages/admin_login');
    }
  } catch (err) {
    next(err)
  }
}

//post admin login
exports.postadminlogin = (req, res,next) => {
  try {
    admin_Helpers.adminlogin(req.body).then((response) => {
      if (response.Status) {
        req.session.admin = response.admin
        req.session.adminlogin = true;
        res.json(response)
      } else {
        res.json(response)
      }
    })
  } catch (err) {
    next(err)
  }
}

//get user details
exports.getuserdetails = (req, res,next) => {
  try {
    admin_Helpers.getuserdetails().then((userdetails) => {
      res.render('admin_pages/admin_userdetails', { userdetails })
    })

  } catch (err) {
    next(err)
  }
}

//get all products
exports.getallProducts = (req, res,next) => {
  try {
    Product_Helpers.GetAllproduct().then((products) => {
      res.render('admin_pages/admin_productlist', { products })
    })
  } catch (err) {
    next(err)
  }

}

//delete edite product
exports.deleteproducts = (req, res,next) => {
  try {
    Product_Helpers.DeleteProduct(req.params.id).then((response) => {
      Images= response.Image
      Images.forEach(async (Image) => {
        await unlinkAsync("public/product-images/"+Image)
    })
      res.json(response)
    })
  } catch (err) {
    next(err)
  }

}

//get edit product page
exports.GetEditProduct = (req, res,next) => {
  try {
    Product_Helpers.GetAllCategory().then((Category) => {
      Product_Helpers.getOneProductDetails(req.params.id).then((product) => {
        res.render('admin_pages/admin_editproduct', { product, Category })
      })
    })
  } catch (err) {
    next(err)
  }

}

//post EditProduct 
exports.PostEditProduct = (req, res,next) => {
  try {
    let id = req.params.id
    let files = req.files
    if (files.length > 0) {
      const image = []
      for (i = 0; i < req.files.length; i++) {
        image[i] = files[i].filename
      }
      req.body.img = image
      Product_Helpers.EditProduct(req.body, id).then((Images) => {
        if (files.length > 0) {
          Images.forEach(async (Image) => {
              await unlinkAsync("public/product-images/"+Image)
          })
        }
        res.redirect('/admin/admin_productlist')


      })
    } else {
      Product_Helpers.EditNoImageProduct(req.body, id).then(() => {
        res.redirect('/admin/admin_productlist')
      })
    }
  } catch (err) {
    next(err)
  }
}

//get add product page
exports.GetAddProduct = (req, res,next) => {
  try {
    Product_Helpers.GetAllCategory().then((Category) => {
      res.render('admin_pages/admin_Addproduct', { Category })
    })
  } catch (err) {
    next(err)
  }
}


///add products
exports.PostAddProduct = (req, res,next) => {
  try {
    let files = req.files
    if (files) {
      const image = []
      for (i = 0; i < req.files.length; i++) {
        image[i] = files[i].filename
      }

      req.body.img = image
      Product_Helpers.AddProduct(req.body).then((data) => {
        res.redirect('/admin/admin_productlist')

      })
    }
  } catch (err) {
    next(err)
  }

}

//user blocking
exports.userBlock = (req, res,next) => {
  try {
    admin_Helpers.userBlocking(req.params.id).then((response) => {
      if (response.status = true) {
        res.json({ Status: true })

      } else {
        res.redirect('/admin/admin_userlist')

      }
    })
  } catch (err) {
    next(err)
  }

}

//user unblocking
exports.UserUnblocking = (req, res,next) => {
  try {
    admin_Helpers.UserUnblocking(req.params.id).then((response) => {
      if (response.Status) {
        res.json(response)
      } else {
        res.redirect('/admin/admin_userlist')

      }
    })

  } catch (err) {
    next(err)
  }
}

//get Categorylist page
exports.getCategorylist = (req, res,next) => {
  try {
    if (req.session.adminlogin) {
      Product_Helpers.GetAllCategory().then((Category) => {
        res.render('admin_pages/Categorylist', { Category, Categoryerr })
      })
    } else {
      res.redirect('/admin/admin_login')

    }
    Categoryerr = null
  } catch (err) {
    next(err)
  }
}


//add categorys
exports.postAddCategory = (req, res,next) => {
  try {
    if (req.session.adminlogin) {
      Product_Helpers.AddCategory(req.body).then((response) => {
        if (response.Status) {
          res.json(response)
        } else {
          res.json(response)
        }
      })
    } else {
      res.redirect('/admin/admin_login')

    }
  } catch (err) {
    next(err)
  }
}

//delete-Category

exports.deleteCategory = (req, res,next) => {
  try {
    Product_Helpers.deleteCategory(req.params.Category).then((response) => {
      res.json(response)
    })
  } catch (err) {
    next(err)
  }
}

//get Category products
exports.getCategoryproducts = (req, res,next) => {
  try {
    Product_Helpers.Categoryproducts(req.params.Category).then((response) => {
      if (response.Status) {
        products = response.data
        res.render('admin_pages/product_Category', { products })
      } else {
        Categoryerr = "!products is mt!"
        res.redirect('/admin/admin_Categorylist')

      }
    })
  } catch (err) {
    next(err)
  }
}

exports.adminlogout = (req, res,next) => {
  try {
    req.session.adminlogin = false
    res.redirect('/admin/admin_login')
  } catch (err) {
    next(err)
  }
}

exports.adminOderslis = (req, res,next) => {
  try {
    admin_Helpers.orderslist().then((order) => {
      res.render('admin_pages/admin-oderslist', { order })
    })
  } catch (err) {
    next(err)
  }
}

exports.GetOdersProduct = (req, res,next) => {
  try {
    let id = req.params.id
    admin_Helpers.GetOdersProduct(id).then((orders) => {
      order = orders[0]
      res.render('admin_pages/oderlist-one-product', { order })
    })
  } catch (err) {
    next(err)
  }
}

//get payment oders check online or case on dellivery
exports.oderPaymentproduct = (req, res,next) => {
  try {
    payment = req.params.Payment
    admin_Helpers.getpaymentoders(payment).then((order) => {
      res.render('admin_pages/admin-oderslist', { order })
    })
  } catch (err) {
    next(err)
  }
}


exports.getCancelOrder = (req, res,next) => {
  try {
    Status = req.params.Status
    admin_Helpers.getCancelOrder(Status).then((order) => {
      res.render('admin_pages/admin-oderslist', { order })
    })
  } catch (err) {
    next(err)
  }
}


exports.salesReport = (req, res,next) => {
  try {
    admin_Helpers.salesReport().then((salesReport) => {
      admin_Helpers.salesReporttotal().then((salesReporttotal) => {
        admin_Helpers.salesReportTotalprice().then((totalprice) => {
          res.render('admin_pages/admin-sales-report', { salesReport, salesReporttotal, totalprice })
        })
      })
    })
  } catch (err) {
    next(err)
  }
}

exports.getCouponPage = (req, res,next) => {
  try {
    admin_Helpers.getCouponPage().then((coupen) => {
      let date = new Date().toJSON().slice(0, 10);
      res.render('admin_pages/admin-Coupon', { coupen, date, exp: false })

    })
  } catch (err) {
    next(err)
  }
}

exports.addCoupon = (req, res,next) => {
  try {
    res.render('admin_pages/admin_addCoupon', { addCouponerr })
    addCouponerr = null
  } catch (err) {
    next(err)
  }
}

exports.postaddCoupon = (req, res,next) => {
  try {
    Coupon = req.body
    admin_Helpers.postaddCoupon(Coupon).then((response) => {
      if (response.Status) {
        res.redirect('/admin/getCouponPage')
      } else {
        addCouponerr = "please change coupen code"
        res.redirect('/admin/admin-addCoupon')
      }
    })
  } catch (err) {
    next(err)
  }
}

exports.expiredOderslist = (req, res,next) => {
  try {
    admin_Helpers.getCouponPage().then((coupen) => {
      let date = new Date().toJSON().slice(0, 10);
      res.render('admin_pages/admin-Coupon', { coupen, date, exp: true })

    })
  } catch (err) {
    next(err)
  }
}


exports.adminEditeCoupon = (req, res,next) => {
  try {
    admin_Helpers.getOneCoupon(req.params.id).then((response) => {
      if (response.Status) {
        Coupon = response.data
        res.render('admin_pages/admin_editCoupon', { Coupon })
      } else {
        res.redirect('/admin/getCouponPage')
      }
    })
  } catch (err) {
    next(err)
  }
}

exports.postEditeCoupon = (req, res,next) => {
  try {
    admin_Helpers.postEditeCoupon(req.body, req.params.id).then((Status) => {
      res.redirect('/admin/getCouponPage')
    })
  } catch (err) {
    next(err)
  }
}

exports.adminDeleteCoupon = (req, res,next) => {
  try {
    admin_Helpers.deletecoupon(req.params.id, req.params.change).then((Status) => {
      res.redirect('back')
    })
  } catch (err) {
    next(err)
  }
}

exports.DeleteCouponPage = (req, res,next) => {
  try {
    admin_Helpers.getCouponPage().then((coupen) => {
      let date = new Date().toJSON().slice(0, 10);
      res.render('admin_pages/admin-deleteCoupon', { coupen, date, exp: false })

    })
  } catch (err) {
    next(err)
  }
}

exports.getBanners = (req, res,next) => {
  try {
    admin_Helpers.getAllbanners().then((banner) => {
      res.render('admin_pages/admin-Banners', { banner })

    })
  } catch (err) {
    next(err)
  }
}

exports.bannerMore = (req, res,next) => {
  try {
    id = req.params.id
    admin_Helpers.getBannersMore(id).then((banners) => {
      if (banners.bannerId === "Footer") {
        res.render('admin_pages/admin_edite-Footer', { banners })

      } else if (banners.bannerId === "contact") {
        res.render('admin_pages/admin_edite-Footer', { banners })

      } else {
        res.render('admin_pages/admin-bannermore', { banners })

      }
    })
  } catch (err) {
    next(err)
  }
}

exports.editBanner = (req, res,next) => {
  try {
    bannerId = req.params.id
    admin_Helpers.getbannerone(req.params.id, req.params.insideId).then((bannerItem) => {
      Product_Helpers.GetAllCategory().then((Category) => {
        res.render('admin_pages/admin-banner-Edit', { bannerItem, Category })

      })
    })
  } catch (err) {
    next(err)
  }
}

exports.posteditBanner = (req, res,next) => {
  try {
    let files = req.files
    if (files.length > 0) {
      let image
      for (i = 0; i < req.files.length; i++) {
        image = files[i].filename
      }
      req.body.img = image
    }
    admin_Helpers.editBanner(req.body, bannerId).then((Images) => {
      res.redirect('/admin/getBanners')
      if (files.length > 0) {
        if(Images.length > 0){
         unlinkAsync("public/banner_image/"+Images)
          
    }
      }
    })
  } catch (err) {
    next(err)
  }
}

exports.changeStatus = (req, res,next) => {
  try {
    admin_Helpers.changeStatus(req.params.status, req.params.orderID, req.params.insideorderId).then((orderStatus) => {
      res.json(orderStatus)
    })
  } catch (err) {
    next(err)
  }
}

exports.editFooter = (req, res,next) => {
  try {
    admin_Helpers.editFooter(req.body).then((Status) => {
      res.redirect('/admin/getBanners')
    })
  } catch (err) {
    next(err)
  }
}

exports.Messages = (req, res,next) => {
  try {
    admin_Helpers.getAllMessages().then((userMessages) => {
      Messages=userMessages.reverse()
      res.render('admin_pages/admin_Messages', { Messages })
    })
  } catch (err) {
    next(err)
  }
}

exports.getOneMessage = (req, res,next) => {
  try {
    admin_Helpers.getoneMessage(req.params.id).then((message) => {
      res.render('admin_pages/admin-OneMessages', { message })
    })
  } catch (err) {
    next(err)
  }
}


exports.editcontact = (req, res,next) => {
  try {
    admin_Helpers.posteditcontact(req.body).then((Status) => {
      res.redirect('/admin/getBanners')
    })
  } catch (err) {
    next(err)
  }
}

exports.errpage = (req, res,next) => {
  try {
    res.render('admin_pages/admin-404')
  } catch (err) {
    next(err)
  }
}

/* For Admin Error Page */
