import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true 
    },
    phone: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    landMark: {
        type: String,
        required: false, 
    },
    house: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true
    },
   type: {
        type: String,
        enum: ['home', 'work', 'other'],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    }
}, { timestamps: true });  


export default mongoose.model('Address', addressSchema);

