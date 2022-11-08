const multer = require("multer");


const User_Helpers = require('../helpers/user_helpers')

//user block or unblock 
exports.verifyactive = (req, res, next) => {
    userId = req.session.user
    User_Helpers.checkactive(userId).then((user) => {
        if (user[0].length !== 0) {
            if (user.userstatus == "Block") {
                req.session.userlogin=null
                res.redirect('/login')
            } else {
                next()
            }
        } else {
            res.redirect('/login')
        }
    })

}

// use session checking
exports.sessioncheck=(req,res,next)=>{
    if(req.session.userlogin){
        next()
    }else{
        res.redirect('/login')

    }
}


exports.adminsessioncheck=(req,res,next)=>{
    if(req.session.adminlogin){
        next()
    }else{
        res.redirect('/admin/admin_login')

    }
}


//banner images
exports.bannerimages=()=>{

    const storage = multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,'public/banner_image')
        },
        filename:(req,file,cb)=>{
            const ext= file.originalname.substr(file.originalname.lastIndexOf('.'))
            cb(null,file.fieldname+'-'+Date.now()+ext)
        }
    })
    return multer({storage:storage})
}

exports.productImages=()=>{
    // requre and set multer

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/product-images')
    },
    filename:(req,file,cb)=>{
        const ext= file.originalname.substr(file.originalname.lastIndexOf('.'))
        cb(null,file.fieldname+'-'+Date.now()+ext)
    }
})
return multer({storage:storage})
}
