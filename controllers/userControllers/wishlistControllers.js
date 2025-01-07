import Product from "../../models/productModel.js";
import User from "../../models/userModel.js";
import Wishlist from "../../models/wishlistModel.js";






export const getWishList=async(req,res)=>{
    try{
        const userId= req.session.userId

        if(!userId){
            return res.redirect('/login')
        }


        const wishlist=await Wishlist.findOne({user:userId}).populate('products')
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
          }

     
          



          res.render('user/wishlist',{user: req.session.user || null, products : wishlist.products || null})
    }catch(err){
        console.log("Error while trying to get the wishlist",err);
        
    }
}




export const removeProductFromWishlist=async(req,res)=>{
    try{
        const {productId}= req.body
        console.log(productId);
        
        const wishList= await Wishlist.findOne({user:req.session.userId})
        if (!wishList) {
            return res.status(404).json({ message: 'Wishlist not found' });
          }

          wishList.products = wishList.products.filter(id => id.toString() !== productId);
          console.log("Product Removed ");
          
          await wishList.save();

          res.redirect('/wishlist')


    }catch(err){
        console.log("Error while trying to remove the product from wishlist",err);
        
    }
}





export const addToWishlist=async(req,res)=>{
    try{
        console.log("Added to wishlist");
        
        const { productId } = req.body;

            if(!req.session.user){
              return  res.redirect('/login')
            }

        const user= await User.findById(req.session.userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          const product= await Product.findById(productId)

          if (!product) {
            return res.status(404).json({ message: 'Product not found' });
          }


          let wishlistItems= await Wishlist.findOne({user:req.session.userId})

          if (!wishlistItems) {
            wishlistItems = new Wishlist({
              user: req.session.userId,
              products: [productId],
            });
          }else {
            // If the product is not already in the wishlist, add it
            if (!wishlistItems.products.includes(productId)) {
                wishlistItems.products.push(productId);
            }
          }
          await wishlistItems.save();


          console.log("Product added to the wishlist successfully");
          
          res.redirect('/wishlist')


    }catch(err){
        console.log("Error while tring to add wishlist");
        
    }
}