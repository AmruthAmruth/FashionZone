import mongoose from 'mongoose'


const walletSchema= mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    balance:{
        type:Number
    },
    transaction:[{
        amount:{
            type:Number
        },
        createdAt:{
            type:Date,
            default:Date.now,
        },
        transactionId:{
            type:String
        },
        productName:{
            type:[String],
        },
        type:{
            type:String,
            enum:["credit",'debit']
        }
    }]
})

export default mongoose.model("Wallet",walletSchema)