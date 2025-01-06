import mongoose from "mongoose";
import Order from "../../models/orderModel.js";
import { v4 as uuidv4 } from 'uuid';
import Address from "../../models/addressModel.js";
import Product from "../../models/productModel.js";
import Cart from "../../models/cartModel.js";



export const createOrder = async (req, res) => {
    try {
        const { totalAmount, products, paymentMethod, selectedAddressId } = req.body;
        const orderId = uuidv4();
        const parsedProducts = JSON.parse(products);
        const newOrder = new Order({
            selectedAddressId,
            totalAmount,
            products: parsedProducts,
            paymentMethod,
            orderId,
            user:req.session.user
        });

        // Save the order
        await newOrder.save();
        console.log("Successfully created an order", newOrder);

        // Update the product stock in the Product collection
        for (let product of parsedProducts) {
            for (let item of product.items) {
                const { productId, quantity } = item;

                const productInStock = await Product.findById(productId);

                if (productInStock) {
                    productInStock.stock -= quantity;
                    if (productInStock.stock < 0) {
                        productInStock.stock = 0;
                    }
                    await productInStock.save();
                    console.log(`Updated product stock for ${productInStock.title}, new stock: ${productInStock.stock}`);
                }
            }
        }

        // Remove ordered products from the user's cart
        const userId = req.session.userId;
        const cart = await Cart.findOne({ userId });

        if (cart && Array.isArray(cart.items)) {
            // Flatten ordered product items into a single array of productIds
            const orderedProductIds = parsedProducts.flatMap(product =>
                product.items.map(item => item.productId.toString())
            );

            // Filter cart items to exclude ordered products
            cart.items = cart.items.filter(cartItem =>
                !orderedProductIds.includes(cartItem.productId.toString())
            );

            // Save the updated cart
            await cart.save();
            console.log("Products removed from the cart");
        } else {
            console.log("Cart is either undefined or does not contain items");
        }

        res.redirect(`/ordersummery/${newOrder._id}`);
    } catch (err) {
        console.log("Error while during the create order", err);
        res.status(500).send("Error creating order");
    }
};




export const orderSummery=async(req,res)=>{
    try{

        const orderId=req.params.orderId
         if(!orderId){
            console.log("Order id is not valid");
            return res.redirect('/checkout')
         }

         const orderProducts= await Order.findById(orderId)
         const addressId= new mongoose.Types.ObjectId(orderProducts.selectedAddressId); 

         const shippedAddress= await Address.findById(addressId)
          
         console.log("Order Summery Page ",orderProducts);
         

         res.render('user/ordersummery', {
            user: req.session.user || null,
            order: orderProducts,
            shippedAddress: shippedAddress 
        });
    }catch(err){
        console.log("Error while getting the ordersummery page ",err);
        
    }
}


export const getOrders = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const userId = req.session.userId;

        // Fetch the orders for the user
        const orders = await Order.find({ user: userId });

        console.log('Fetched Orders:', orders);  // Debugging line
        req.userOrder = orders;

        next();
    } catch (err) {
        console.log("Error while trying to fetch the orders", err);
        next(err);  // You might want to pass the error to the next middleware
    }
};


export const cancelOrder=async(req,res)=>{
    try{
        const { orderId } = req.body; 

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'Cancelled' },  
            { new: true } 
          );

          if (!updatedOrder) {
            return res.status(400).json({ success: false, message: 'Order not found' });
          }


          for (const product of updatedOrder.products) {
            for (const item of product.items) {
              // Find the product in the inventory by its ID and update the quantity
              const productInInventory = await Product.findById(item.productId);
      
              if (productInInventory) {
                // Increase the quantity of the product by the quantity ordered
                productInInventory.stock += item.quantity;
      
                // Save the updated product
                await productInInventory.save();
              }
            }
          }




          res.json({ success: true, message: 'Order cancelled successfully' });

    }catch(err){
        console.log("Error while cancel the product",err);
        
    }
}