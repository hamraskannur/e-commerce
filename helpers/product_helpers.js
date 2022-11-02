const mongoose = require('mongoose');
const db = require('../config/connection')
const Product_collection = require('../models/Schema/product_Schema')
const Category_collection = require('../models/Schema/Category_schema')

const { promiseImpl } = require('ejs');
const { response } = require('../app');

module.exports = {
    //Add product with vender email and id
    AddProduct: (product) => {
        return new Promise((resolve, reject) => {
            try {
                
          
            const NewProduct = new Product_collection({
                title: product.title,
                price: product.price,
                description: product.description,
                quantity: product.quantity,
                category: product.category,
                Images:product.img
            })
            NewProduct.save().then((data) => {
                resolve(data._id)
            })
        } catch (error) {
            location.href = '/err'
        }
        })
    },   
    GetAllproduct: () => {
        return new Promise((resolve, reject) => {
            try {
                
           
            Product_collection.find((err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    console.log(err);
                }
            })
        } catch (error) {
            location.href = '/err'
        }

        })
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    getOneProductDetails: (productId) => {
        return new Promise((resolve, reject) => {
            try {
                
          
            Product_collection.findById(productId, (err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    console.log(err);
                    resolve(err)
                }
            })
        } catch (error) {
            location.href = '/err'
        }
        })
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    EditProduct: (product, ProductId) => {
        return new Promise(async(resolve, reject) => {
            try {
                
           
         oldproduct =  await Product_collection.findById(ProductId)
       
            Product_collection.updateOne({ _id: ProductId }, {
                $set: {
                    title: product.title,
                    price: product.price,
                    description: product.description,
                    quantity: product.quantity,
                    category: product.category,
                    Images:product.img
                }
            }).then((data) => {
                if (data) {
                    resolve(oldproduct.Images)
                } else {
                    console.log(err);
                    resolve()
                }
            })
        } catch (error) {
            location.href = '/err'
        }
        })
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////
    DeleteProduct: (ProductId) => {
        return new Promise((resolve, reject) => {
            let response = {
                Status: null
            }
            try {
                
         
            Product_collection.findByIdAndDelete({ _id: ProductId }, (err, data) => {
                if (!err) {
                    response.Status = true
                    resolve(response)
                } else {
                    response.Status = false
                    resolve(response)
                }
            })
        } catch (error) {
            location.href = '/err'
        }
        })

    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////
  
   ,
    Categoryproducts: (category) => {
        console.log(category);
        return new Promise((resolve, reject) => {
            let response = {
                Status: false,
                data: null
            }
            try {
                
           
            Product_collection.find({ category:category }, (err, data) => {
                if (!err) {
                    if (data.length > 0) {
                        response.Status = true
                        response.data = data
                        resolve(response)
                    } else {
                        response.Status = false
                        resolve(response)

                    }

                } else {
                    response.Status = false
                    console.log(err);
                    resolve(response)

                }
            })
        } catch (error) {
            location.href = '/err'
        }
        })
    },
    AddCategory: (CategoryName) => {
        return new Promise(async(resolve, reject) => {
            let response={
                Status:false
            }
            try {
         
            Category= await Category_collection.find({Category:CategoryName.newcategory})
            if(Category.length==0){
                const NewCategory = new Category_collection({
                    Category: CategoryName.newcategory
                })
                NewCategory.save().then((data) => {
                    if(data){
                        response.Status=true
                        resolve(response)
                    }else{
                        response.Status=false
                        resolve(response)

                    }
                })
            }else{
                response.Status=false
                resolve(response)
            }
          
        } catch (error) {
            location.href = '/err'
        }
        })
    },
    GetAllCategory: () => {
        return new Promise((resolve, reject) => {
            try {
                
       
            Category_collection.find((err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    console.log(err);
                }
            })
        } catch (error) {
            location.href = '/err'
        }
        })
    },
    deleteCategory: (Category) => {
        return new Promise(async(resolve, reject) => {
            let response={
                Status:false
            }
            try {
                
         
           let newCategory=await Product_collection.find({category:Category})
           length= newCategory.length 
           if(length === 0){
            Category_collection.deleteOne({ category: Category }, (err, data) => {
                if(data){
                    response.Status=true
                    resolve(response)
                }else{
                    response.Status=false
                    resolve(response)
                }
              
            })

           }else{
            response.Status=false
            resolve(response)
           }

        } catch (error) {
            location.href = '/err'
        }
        })
    },
    EditNoImageProduct: (product, ProductId) => {
        return new Promise((resolve, reject) => {
            try {
                
           
            Product_collection.updateOne({ _id: ProductId }, {
                $set: {
                    title: product.title,
                    price: product.price,
                    description: product.description,
                    quantity: product.quantity,
                    category: product.category
                }
            }).then((err, data) => {
                if (!err) {
                    resolve()
                } else {
                    console.log(err);
                    resolve()
                }
            })
        } catch (error) {
            location.href = '/err'
        }
        })
    },
    MySearch:(searchinpute)=>{
        try {
            
      
        return new Promise(async (resolve, reject) => {
    Product_collection.find({title:searchinpute},(err,data)=>{
        resolve(data)
    })
   
        })
    } catch (error) {
        location.href = '/err'
    }
    }
}







