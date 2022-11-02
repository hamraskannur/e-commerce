const Product_Helpers = require('../helpers/product_helpers')
const admin_Helpers = require('../helpers/admin_helpers');
const { EditProduct } = require('../helpers/product_helpers');
const { response } = require('../app');
var fs = require('fs');
let Categoryerr = null
let todayprice = [0]
let usercount = 0
let pendingproduct = 0
let cancelproduct = 0
let addCouponerr = null
let editCouponerr = ""
let bannerId=null


exports.gethomepage = (req, res, next) => {
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

}
// get admin login page
exports.getadminlogin = (req, res) => {
  if (req.session.adminlogin) {
    res.redirect('/admin')
  } else {
    res.render('admin_pages/admin_login');
  }
}

//post admin login
exports.postadminlogin = (req, res) => {
  admin_Helpers.adminlogin(req.body).then((response) => {
    if (response.Status) {
      req.session.admin = response.admin
      req.session.adminlogin = true;
       res.json(response)
    } else {
        res.json(response)
    }
  })
}

//get user details
exports.getuserdetails = (req, res) => {
    admin_Helpers.getuserdetails().then((userdetails) => {
      res.render('admin_pages/admin_userdetails', { userdetails })
    })
 

}

//get all products
exports.getallProducts = (req, res) => {
    Product_Helpers.GetAllproduct().then((products) => {
      res.render('admin_pages/admin_productlist', { products })
    })


}

//delete edite product
exports.deleteproducts = (req, res) => {
    Product_Helpers.DeleteProduct(req.params.id).then((response) => {

res.json(response)
    })
 

}

//get edit product page
exports.GetEditProduct = (req, res) => {
    Product_Helpers.GetAllCategory().then((Category) => {
      Product_Helpers.getOneProductDetails(req.params.id).then((product) => {
        res.render('admin_pages/admin_editproduct', { product, Category })
      })
    })


}

//post EditProduct 
exports.PostEditProduct = (req, res) => {
    let id = req.params.id
    let files = req.files
    if (files.length>0) {
      const image = []
      for (i = 0; i < req.files.length; i++) {
        image[i] = files[i].filename
      }
      req.body.img = image
      Product_Helpers.EditProduct(req.body, id).then((Images) => {
      
        res.redirect('/admin/admin_productlist')
   
       
      })
}else{
  Product_Helpers.EditNoImageProduct(req.body, id).then(() => {
    res.redirect('/admin/admin_productlist')
  })
}
}

//get add product page
exports.GetAddProduct = (req, res) => {
    Product_Helpers.GetAllCategory().then((Category) => {
      res.render('admin_pages/admin_Addproduct', { Category })
    })

}


///add products
exports.PostAddProduct = (req, res) => {
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




}

//user blocking
exports.userBlock = (req, res) => {
   
    admin_Helpers.userBlocking(req.params.id).then((response) => {
      if (response.status = true) {
        res.json({ Status: true })

      } else {
        res.redirect('/admin/admin_userlist')

      }
    })


}

//user unblocking
exports.UserUnblocking = (req, res) => {
    admin_Helpers.UserUnblocking(req.params.id).then(( response) => {
      if (response.Status) {
        res.json(response)
      } else {
        res.redirect('/admin/admin_userlist')

      }
    })
  

}

//get Categorylist page
exports.getCategorylist = (req, res) => {
  if (req.session.adminlogin) {
    Product_Helpers.GetAllCategory().then((Category) => {
      res.render('admin_pages/Categorylist', { Category, Categoryerr })
    })
  } else {
    res.redirect('/admin/admin_login')

  }
  Categoryerr = null
}


//add categorys
exports.postAddCategory = (req, res) => {
  if (req.session.adminlogin) {
    Product_Helpers.AddCategory(req.body).then((response) => {
      if( response.Status){
        res.json(response)
      }else{
        res.json(response)
      }
    })
  } else {
    res.redirect('/admin/admin_login')

  }
}

//delete-Category

exports.deleteCategory = (req, res) => {
  Product_Helpers.deleteCategory(req.params.Category).then((response) => {
    res.json(response)
  })
}

//get Category products
exports.getCategoryproducts = (req, res) => {
  Product_Helpers.Categoryproducts(req.params.Category).then((response) => {
    if (response.Status) {
      products = response.data
      res.render('admin_pages/product_Category', { products })
    } else {
      Categoryerr = "!products is mt!"
      res.redirect('/admin/admin_Categorylist')

    }
  })
}

exports.adminlogout = (req, res) => {
  req.session.adminlogin = false
  res.redirect('/admin/admin_login')
}

exports.adminOderslis = (req, res) => {
  admin_Helpers.orderslist().then((order) => {
    res.render('admin_pages/admin-oderslist', { order })
  })

}

exports.GetOdersProduct = (req, res) => {
  let id = req.params.id
  admin_Helpers.GetOdersProduct(id).then((orders) => {
    order = orders[0]
    res.render('admin_pages/oderlist-one-product', { order })
  })
}

//get payment oders check online or case on dellivery
exports.oderPaymentproduct = (req, res) => {
  payment = req.params.Payment
  admin_Helpers.getpaymentoders(payment).then((order) => {
    res.render('admin_pages/admin-oderslist', { order })
  })
}


exports.getCancelOrder = (req, res) => {
  Status = req.params.Status
  admin_Helpers.getCancelOrder(Status).then((order) => {
    res.render('admin_pages/admin-oderslist', { order })

  })
}


exports.salesReport = (req, res) => {
  admin_Helpers.salesReport().then((salesReport) => {
    admin_Helpers.salesReporttotal().then((salesReporttotal) => {
      admin_Helpers.salesReportTotalprice().then((totalprice) => {
        res.render('admin_pages/admin-sales-report', { salesReport, salesReporttotal, totalprice })

      })

    })

  })
}

exports.getCouponPage = (req, res) => {
  admin_Helpers.getCouponPage().then((coupen) => {
    let date = new Date().toJSON().slice(0, 10);
    res.render('admin_pages/admin-Coupon', { coupen, date, exp: false })

  })

}

exports.addCoupon = (req, res) => {
  res.render('admin_pages/admin_addCoupon', { addCouponerr })
  addCouponerr = null
}

exports.postaddCoupon = (req, res) => {
  Coupon = req.body
  admin_Helpers.postaddCoupon(Coupon).then((response) => {
    if (response.Status) {
      res.redirect('/admin/getCouponPage')
    } else {
      addCouponerr = "please change coupen code"
      res.redirect('/admin/admin-addCoupon')
    }
  })
}

exports.expiredOderslist = (req, res) => {
  admin_Helpers.getCouponPage().then((coupen) => {
    let date = new Date().toJSON().slice(0, 10);
    res.render('admin_pages/admin-Coupon', { coupen, date, exp: true })

  })
}


exports.adminEditeCoupon = (req, res) => {
  admin_Helpers.getOneCoupon(req.params.id).then((response) => {
    if (response.Status) {
      Coupon= response.data
      res.render('admin_pages/admin_editCoupon', { Coupon })
    } else {
      res.redirect('/admin/getCouponPage')
    }
  })
}

exports.postEditeCoupon=(req,res)=>{
   admin_Helpers.postEditeCoupon(req.body,req.params.id).then(()=>{
res.redirect('/admin/getCouponPage')
   })
}

exports.adminDeleteCoupon=(req,res)=>{
  admin_Helpers.deletecoupon(req.params.id,req.params.change).then(()=>{
    res.redirect('back')

  })
}

exports.DeleteCouponPage=(req,res)=>{
  admin_Helpers.getCouponPage().then((coupen) => {
    let date = new Date().toJSON().slice(0, 10);
    res.render('admin_pages/admin-deleteCoupon', { coupen, date, exp: false })

  })

}

exports.getBanners=(req,res)=>{
  admin_Helpers.getAllbanners().then((banner)=>{
    res.render('admin_pages/admin-Banners',{banner})

  })

}

exports.bannerMore=(req,res)=>{
 id= req.params.id
 admin_Helpers.getBannersMore(id).then((banners)=>{
if(banners.bannerId==="Footer"){
   res.render('admin_pages/admin_edite-Footer',{banners})

}else{
  res.render('admin_pages/admin-bannermore',{banners})

}
 })
}

exports.editBanner=(req,res)=>{
  bannerId=req.params.id
admin_Helpers.getbannerone(req.params.id,req.params.insideId).then((bannerItem)=>{
  Product_Helpers.GetAllCategory().then((Category) => {
    res.render('admin_pages/admin-banner-Edit',{bannerItem,Category})

  })
})
}

exports.posteditBanner=(req,res)=>{
    let files = req.files
      if (files.length>0) {
        let image 
        for (i = 0; i < req.files.length; i++) {
          image= files[i].filename
        }
        req.body.img = image
      }
        admin_Helpers.editBanner(req.body,bannerId).then(()=>{
             res.redirect('/admin/getBanners')
        })

}

exports.changeStatus=(req,res)=>{

  admin_Helpers.changeStatus(req.params.status,req.params.orderID,req.params.insideorderId).then((orderStatus)=>{
    res.json(orderStatus)
  })
}

exports.editFooter=(req,res)=>{
  admin_Helpers.editFooter(req.body).then(()=>{
    res.redirect('/admin/getBanners')
  })
}

exports.Messages=(req,res)=>{
  admin_Helpers.getAllMessages().then((Messages)=>{
    res.render('admin_pages/admin_Messages',{Messages})
  })
}

exports.getOneMessage=(req,res)=>{
  admin_Helpers.getoneMessage(req.params.id).then((message)=>{
  
    res.render('admin_pages/admin-OneMessages',{message})

  })
}