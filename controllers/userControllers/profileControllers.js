import Address from "../../models/addressModel.js";
import mongoose from "mongoose";




export const getProfilePage = (req, res) => {
    
    res.render('user/profile', { user: req.session.user || null, userAddress: req.userAddress || null });
};

export const getAddress = async (req, res, next) => {
    try {
        const userId = req.session.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid or missing user ID');
             return next()
        }

        const address = await Address.find({ userId: userId });
        
        req.userAddress = address;
   
        
        next();
    } catch (err) {
        console.error('Error fetching the address:', err);
        return res.status(500).json({ message: 'Server error, please try again later.' });
    }
};



export const editAddress=async(req,res)=>{
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

      
        return res.redirect('/profile');
    } catch (err) {
        console.error('Error updating address:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}



export const deleteAddress=async(req,res)=>{
    try {
        const { addressId } = req.params;  
        const userId = req.session.userId; 

        
        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({ message: 'Invalid address ID' });
        }

       
        const address = await Address.findOne({ _id: addressId, userId });

        if (!address) {
            return res.status(404).json({ message: 'Address not found or does not belong to the user' });
        }


        await Address.deleteOne({ _id: addressId });

        console.log('Address deleted successfully');
        req.flash('message', 'Address deleted successfully');
        return res.redirect('/profile');
    } catch (err) {
        console.error('Error while deleting address:', err);
        return res.status(500).json({ message: 'Server error, please try again later.' });
    }
}






    export const createAddress = async (req, res) => {
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
    
            const userId = req.session.userId; // Assuming userId is stored in session
    
            if (!req.session.user) {
                console.log("Login please");
                return res.redirect('/profile');
            }
    
            if (!name || !phone || !country || !state || !district || !city || !house || !pincode || !type) {
                req.flash('message', "Invalid Credentials");
                console.log("Invalid Credentials");
                return res.redirect('/profile');
            }
    
            // Convert userId to ObjectId (if it's not already)
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
                userId: objectIdUserId // Store the userId as an ObjectId
            });
    
            await newAddress.save();
    
            console.log("Address Added Successfully");
            req.flash('message', "Address Added Successfully");
            return res.redirect('/profile');
        } catch (err) {
            console.error('Error while creating the new Address:', err);
            return res.status(500).json({ message: 'Server error, please try again later.' });
        }
    };