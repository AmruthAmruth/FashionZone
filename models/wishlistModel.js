import mongoose, { mongo } from "mongoose";


const WishlistSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Assuming you have a User model
      required: true,
    },
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',  // Assuming you have a Product model
      required: true,
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  export default mongoose.model('Wishlist',WishlistSchema)