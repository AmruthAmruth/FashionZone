import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  selectedAddressId: { type: String, required: true }, 
  totalAmount: { type: String, required: true },
  user: { type: String, required: true },
  products: [{ 
      userId: { type: String, required: true },
      items: [{
          productId: { type: String, required: true },
          quantity: { type: Number, required: true },
          title: { type: String, required: true },
          image: { type: String, required: true },
          price: { type: Number, required: true },
      }],
      __v: { type: Number }
  }],
  paymentMethod: { type: String, required: true },
  paymentStatus: { 
      type: String, 
      enum: ['Pending', 'Paid'],
      default: 'Pending', 
      required: true
  },
  paymentId: { type: String },  // Store Razorpay payment ID or similar
  status: { 
      type: String, 
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], 
      default: 'Pending', 
      required: true
  },
  orderId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", OrderSchema);


