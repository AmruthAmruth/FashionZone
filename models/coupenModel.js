import mongoose from "mongoose";



const couponSchema = new mongoose.Schema({
    couponId: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    expiryDate: {
        type: Date,
        required: true
    }
    ,
    minPurchaseAmount: {
        type: Number,
        required:true
    },
    usedUsers:[
        {
            type:String
        }
    ],
    isActive: {
        type: Boolean,
        default:true
    }
}); 


export default mongoose.model('Coupen',couponSchema)