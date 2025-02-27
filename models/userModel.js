import mongoose from "mongoose";

const userSchema=mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    refCode:{
        type:String,
    },
    myCode:{
        type:String,
        require:true
    },
    redeemed:{
        type:String
    },
    isActive: {
        type: Boolean,
        default: true
      },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

export default mongoose.model('User', userSchema);