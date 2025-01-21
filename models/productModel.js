import mongoose from "mongoose";

// Create the schema
const productSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  disPrice: {
    type: Number,
    required: false
  },
  color: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
  },
  images: {
    type: [String], 
    required: true,
    
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const Product = mongoose.model('Product', productSchema);

export default Product;
