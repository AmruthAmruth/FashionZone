
import mongoose from "mongoose";



const offerSchema = new mongoose.Schema({

    offerName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    productName: [{ type: String, required: true }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    category: [
        {
            type: String,
            required: true
        }
    ],
    status: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});


export default mongoose.model('Offer', offerSchema)