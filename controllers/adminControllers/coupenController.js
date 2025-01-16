
import Coupon from '../../models/coupenModel.js'


export const getCoupenspage=async(req,res)=>{
    try{

const coupons  = await Coupon.find()


res.render('admin/coupens',{coupons})
    }catch(err){
        console.log("Error while tring to get coupens page",err);
        
    }
}


export const addCoupon = async (req, res) => {
    try {
        
        const {
            couponId,
            discount,
            description,
            expiryDate,
            minPurchaseAmount,
            isActive
        } = req.body;

        
        const existingCoupon = await Coupon.findOne({ couponId });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon ID already exists' });
        }

     
        const newCoupon = new Coupon({
            couponId,
            discount,
            description,
            expiryDate,
            minPurchaseAmount,
            isActive
        });

        
        await newCoupon.save();

       
        res.redirect('/admin/coupones')
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


export const editCoupon = async (req, res) => {
    try {
      const {
        couponId,
        discount,
        description,
        expiryDate,
        minPurchaseAmount,
        status,
        editCouponIdHidden,  
      } = req.body;
  
      const coupon = await Coupon.findById(editCouponIdHidden);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
  
      coupon.couponId = couponId;
      coupon.discount = discount;
      coupon.description = description;
      coupon.expiryDate = new Date(expiryDate);  
      coupon.minPurchaseAmount = minPurchaseAmount;
      coupon.isActive = status === 'true'; 
  
     
      await coupon.save();
      
    
      res.json({ success: true, message: 'Coupon updated successfully!' });
    } catch (error) {
      console.error('Error updating coupon:', error);
      res.status(500).json({ success: false, message: 'An error occurred while updating the coupon. Please try again later.' });
    }
  };


export const couponSoftDelete = async (req, res) => {
    try {
        const { couponId, isActive } = req.body;

        // Find the coupon by ID
        const coupon = await Coupon.findOne({ couponId });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        // Toggle the 'isActive' field
        coupon.isActive = isActive;
        await coupon.save();

        // Send a success response
        return res.status(200).json({
            success: true,
            message: `Coupon has been marked as ${isActive ? 'Active' : 'Inactive'}`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.'
        });
    }
};
