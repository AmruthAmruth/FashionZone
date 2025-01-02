import mongoose from "mongoose";


const categorySchema=mongoose.Schema({
         category:{
            type:String,
            require:true
         },
         description:{
            type:String,
            require:true
         },
         isListed:{
            type:Boolean
         }
})

export default mongoose.model('Category', categorySchema);
