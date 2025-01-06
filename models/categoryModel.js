import mongoose from "mongoose";


const categorySchema = mongoose.Schema({
   category: {
       type: String,
       required: true 
   },
   description: {
       type: String,
       required: true 
   },
   isListed: {
       type: Boolean,
       default: true 
   }
});

export default mongoose.model('Category', categorySchema);
