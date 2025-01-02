
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    title:{type:String,require:true},
    image:{type:String,require:true},
    price: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema],
});

export default mongoose.model('Cart', cartSchema);
