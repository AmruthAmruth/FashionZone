



// --------------------Checkout Section ---------------------------------

import mongoose from "mongoose";
import Address from "../../models/addressModel.js";
import Cart from "../../models/cartModel.js";


export const checkoutPage=async(req,res)=>{

    try{
    
const user=req.session.user || null
const totalPrice=req.totalAmount
        const userAddress = await Address.find({ userId: req.session.userId });
        const userProducts = await Cart.find({ userId: req.session.userId });

    //   console.log(JSON.stringify(userProducts, null, 2));
   
      
        
        res.render('user/checkout', {  user,userAddress: userAddress || [] ,userProducts,totalPrice});
    }catch(err){
        console.log("Error while loading checkoutpage",err);
        
    }
    
}



export const proceedToChekout=async(req,res,next)=>{
    try{
        const {totalPrice}=req.body
       console.log("Total amount of the product",totalPrice);
       
        req.totalAmount=totalPrice
   
     next()
    }catch(err){
        console.log("Error while proceed to checkout",err);
        
    }
}





// export const proceedToChekout=async(req,res,next)=>{
//     try{
//         const { shipping, totalPrice } = req.body;
        
//         const paymentInfo = {
//             shippingMethod: shipping,
//             totalAmount: totalPrice,
//             paymentMethod: 'Cash on Delivery',
//         };
//     }catch(err){
//         console.log("Error while proceed to chekout");
        
//     }
// }



    export const checkoutAddAddress = async (req, res) => {
        try {
            console.log(req.body);
            
            const {
                name,
                phone,
                country,
                state,
                district,
                city,
                landMark,
                house,
                pincode,
                type
            } = req.body;  
    
            const userId = req.session.userId; 
    
            if (!req.session.user) {
                console.log("Login please");
                return res.redirect('/login');
            }
    
            if (!name || !phone || !country || !state || !district || !city || !house || !pincode || !type) {
                req.flash('message', "Invalid Credentials");
                console.log("Invalid Credentials");
                return res.redirect('/profile');
            }
    
            const objectIdUserId = new mongoose.Types.ObjectId(userId);
    
            const newAddress = new Address({
                name,
                phone,
                country, 
                state,
                district,
                city,
                landMark,
                house,
                pincode,
                type,
                userId: objectIdUserId 
            });
    
            await newAddress.save();
    
            console.log("Address Added Successfully");
            req.flash('message', "Address Added Successfully");
            return res.redirect('/checkout');
        } catch (err) {
            console.error('Error while creating the new Address:', err);
            return res.status(500).json({ message: 'Server error, please try again later.' });
        }
    };



    
    export const checkoutEditAddress=async(req,res)=>{
        try {
            const { addressId, name, house, landmark, city, state, country, pincode, phone } = req.body;
    
            const updatedAddress = await Address.findByIdAndUpdate(addressId, {
                name,
                house,
                landMark: landmark || '',
                city,
                state,
                country,
                pincode,
                phone
            }, { new: true });
    
            if (!updatedAddress) {
                return res.status(404).json({ message: 'Address not found' });
            }
    
          
            return res.redirect('/checkout');
        } catch (err) {
            console.error('Error updating address:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }