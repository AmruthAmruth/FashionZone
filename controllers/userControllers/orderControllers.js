import mongoose from "mongoose";
import Order from "../../models/orderModel.js";
import { v4 as uuidv4 } from 'uuid';
import Address from "../../models/addressModel.js";
import Product from "../../models/productModel.js";
import Cart from "../../models/cartModel.js";
import Coupon from "../../models/coupenModel.js"
import Razorpay from "razorpay";
import dotenv from 'dotenv';
import crypto from 'crypto'
import Wallet from "../../models/walletModel.js";
import User from "../../models/userModel.js";
dotenv.config();



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
            user: req.session.user
        });


        await newOrder.save();
        console.log("Successfully created an order", newOrder);

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

        const userId = req.session.userId;

        const user= await User.findById(userId)
        console.log(user);
        
        if(user.redeemed){
         const coupon = await Coupon.findOne({couponId:user.redeemed})
         coupon.usedUsers.push(req.session.userId);
         console.log("COupon added successfully");
         
          await coupon.save();
          user.redeemed=null
        }



        const cart = await Cart.findOne({ userId });

        if (cart && Array.isArray(cart.items)) {

            const orderedProductIds = parsedProducts.flatMap(product =>
                product.items.map(item => item.productId.toString())
            );


            cart.items = cart.items.filter(cartItem =>
                !orderedProductIds.includes(cartItem.productId.toString())
            );


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


export const paymentFailerPage = async (req, res) => {
    try {

        if (!req.session.user) {
            return res.redirect('/login');
        }


        const orderId = req.params.orderId
        if (!orderId) {
            console.log("Order id is not valid");
            return res.redirect('/checkout')
        }

        const orderProducts = await Order.findById(orderId)
        console.log(orderProducts);

        // Send order data to the EJS template
        res.render('user/paymentfailed', {
            user: req.session.user || null,
            id: orderProducts._id,
            orderId: orderProducts.orderId,
            totalAmount: orderProducts.totalAmount,
            paymentMethod: orderProducts.paymentMethod,
            paymentStatus: orderProducts.paymentStatus,
        });
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).send('Something went wrong');
    }
}


const razorpayInstance = new Razorpay({
    key_id: "rzp_test_eEMIhlHUZ45CcM",
    key_secret: "JRjeQHH3jzKaEjp1V912XmSA",
});


// razorpay



export const createRazorpayOrder = async (req, res) => {
    try {
        console.log("Create razorpay order will work", req.body);

        const { totalAmount, products, paymentMethod, selectedAddressId } = req.body;

        const parsedProducts = typeof products === "string" ? JSON.parse(products) : products;

        if (!totalAmount || !products || !paymentMethod || !selectedAddressId) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        if (totalAmount <= 0) {
            return res.status(400).json({ error: "Invalid total amount." });
        }

        const order = await razorpayInstance.orders.create({
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });


        const newOrder = new Order({
            selectedAddressId,
            totalAmount: totalAmount.toString(),
            user: req.session.user,
            products: parsedProducts,
            paymentMethod,
            orderId: order.id,
            paymentStatus: "Pending",
            status: "Pending",
        });

        await newOrder.save();

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
                    
                }
            }
        }

        const userId = req.session.userId;
        const cart = await Cart.findOne({ userId });

        if (cart && Array.isArray(cart.items)) {
            const orderedProductIds = parsedProducts.flatMap(product =>
                product.items.map(item => item.productId.toString())
            );

            cart.items = cart.items.filter(cartItem =>
                !orderedProductIds.includes(cartItem.productId.toString())
            );

            await cart.save();
            console.log("Products removed from the cart");
        } else {
            console.log("Cart is either undefined or does not contain items");
        }

        const user= await User.findById(userId)
        
        if(user.redeemed){
         const coupon = await Coupon.findOne({couponId:user.redeemed})
         coupon.usedUsers.push(req.session.userId);
         console.log("COupon added successfully");
         
          await coupon.save();
          user.redeemed=null
        }


        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            order: newOrder._id
        });
    } catch (err) {
        console.log("Error while creating Razorpay order:", err);
        res.status(500).json({ error: "Error creating Razorpay order. Please try again." });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        console.log("Verify razorpay order is workign now", req.body);

        const { orderId, paymentId, signature } = req.body;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({ error: "Missing payment verification details." });
        }

        const expectedSignature = crypto
            .createHmac("sha256", "JRjeQHH3jzKaEjp1V912XmSA")
            .update(orderId + "|" + paymentId)
            .digest("hex");

        const order = await Order.findOne({ orderId })

        if (!order) {
            throw new Error('Order not found');
        }

        if (expectedSignature === signature) {
            order.paymentStatus = "Paid"
            await order.save()
            res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            order.paymentStatus = "Failed"
            await order.save()
            res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (err) {
        console.log("Error during Razorpay payment verification:", err);
        res.status(500).json({ error: "Error verifying payment. Please try again." });
    }
};


// ////////////////////////////////




export const contineOrderPayment = async (req, res) => {
    try {
        const { totalAmount, orderId } = req.body;

        if (!totalAmount || !orderId) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        if (totalAmount <= 0) {
            return res.status(400).json({ error: "Invalid total amount." });
        }

        // Assuming razorpayInstance is initialized correctly
        const order = await razorpayInstance.orders.create({
            amount: totalAmount * 100, // Razorpay expects the amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        // Return the necessary data to frontend for Razorpay checkout
        return res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });

    } catch (err) {
        console.log("Error while creating Razorpay payment", err);
        return res.status(500).json({ error: "Internal server error." });
    }
}





export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;
        console.log("Order Id", razorpay_order_id);

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expected_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        console.log('Received razorpay_signature:', razorpay_signature);
        console.log('Generated expected_signature:', expected_signature);

        const order = await Order.findOne({ orderId })
        if (expected_signature === razorpay_signature) {
            order.paymentStatus = "Paid"
            await order.save();
            res.status(200).json({ success: true, message: "Payment verified" });
        } else {

            order.paymentStatus = "Failed";
            await order.save();
            res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.error("Error during payment verification:", error);
        res.status(500).json({ success: false, message: "An error occurred while verifying payment" });
    }
};









export const orderSummery = async (req, res) => {
    try {



        const orderId = req.params.orderId
        if (!orderId) {
            console.log("Order id is not valid");
            return res.redirect('/checkout')
        }

        const orderProducts = await Order.findById(orderId)
        const addressId = new mongoose.Types.ObjectId(orderProducts.selectedAddressId);

        const shippedAddress = await Address.findById(addressId)

        console.log("Order Summery Page ", orderProducts);



        res.render('user/ordersummery', {
            user: req.session.user || null,
            order: orderProducts,
            shippedAddress: shippedAddress
        });
    } catch (err) {
        console.log("Error while getting the ordersummery page ", err);

    }
}


export const getOrders = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const userId = req.session.userId;


        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });


        req.userOrder = orders;

        next();
    } catch (err) {
        console.log("Error while trying to fetch the orders", err);
        next(err);
    }
};



// ------------------------------------------Order wise cancelation and return-----------------------------------------------------------

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'Cancelled' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(400).json({ success: false, message: 'Order not found' });
        }
        let productName;

        for (const product of updatedOrder.products) {
            for (const item of product.items) {

                const productInInventory = await Product.findById(item.productId);

                if (productInInventory) {
                    productName = productInInventory.title
                    productInInventory.stock += item.quantity;
                    await productInInventory.save();
                }
            }
        }


        const totalAmount = updatedOrder.products.reduce((sum, product) => {
            return sum + product.items.reduce((itemSum, item) => {
                return itemSum + item.price * item.quantity;
            }, 0);
        }, 0);


        let userWallet = await Wallet.findOne({ user: req.session.userId });
        if (!userWallet) {

            userWallet = new Wallet({ user: req.session.userId, balance: 0, transaction: [] });
        }

        userWallet.balance += totalAmount;
        userWallet.transaction.push({
            amount: totalAmount,
            transactionId: `TXN${Date.now()}`,
            productName: productName,
            type: 'credit',
        });
        await userWallet.save();


        res.json({ success: true, message: 'Order cancelled successfully and wallet updated' });

    } catch (err) {
        console.log("Error while cancel the product", err);

    }
}
export const returnProduct = async (req, res) => {
    try {
        const orderId = req.body.orderId

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'Returned' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(400).json({ success: false, message: 'Order not found' });
        }


        let productName;

        for (const product of updatedOrder.products) {
            for (const item of product.items) {

                const productInInventory = await Product.findById(item.productId);

                if (productInInventory) {
                    productName = productInInventory.title
                    productInInventory.stock += item.quantity;
                    await productInInventory.save();
                }
            }
        }


        const totalAmount = updatedOrder.products.reduce((sum, product) => {
            return sum + product.items.reduce((itemSum, item) => {
                return itemSum + item.price * item.quantity;
            }, 0);
        }, 0);



        let userWallet = await Wallet.findOne({ user: req.session.userId });
        if (!userWallet) {

            userWallet = new Wallet({ user: req.session.userId, balance: 0, transaction: [] });
        }

        userWallet.balance += totalAmount;
        userWallet.transaction.push({
            amount: totalAmount,
            transactionId: `TXN${Date.now()}`,
            productName: productName,
            type: 'credit',
        });
        await userWallet.save();


        res.json({ success: true, message: 'Order retuned successfully and wallet updated' });





    } catch (err) {
        console.log("Error while returning the product", err);

    }
}



//-----------------------Product wise cancelation and return ------------------------------------------------------------
export const updateOrderAndProduct = async (orderId, productId, action, userId) => {
    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return { success: false, message: "Order not found." };
        }

        const orderProduct = order.products[0]?.items.find(item => item.productId === productId);
        if (!orderProduct) {
            return { success: false, message: "Product not found in the order." };
        }

        orderProduct.display = false;

        const product = await Product.findById(productId);
        if (!product) {
            return { success: false, message: "Product not found in the database." };
        }

        // Update product stock
        if (['return', 'cancel'].includes(action)) {
            product.stock += orderProduct.quantity;
            await product.save();
        }

        // Update user wallet
        const productPrice = orderProduct.price;
        let userWallet = await Wallet.findOne({ user: userId }) || new Wallet({ user: userId, balance: 0, transaction: [] });

        userWallet.balance += productPrice;
        userWallet.transaction.push({
            amount: productPrice,
            transactionId: `TXN${Date.now()}`,
            productName: product.title || "Unknown Product",
            type: "credit",
        });
        await userWallet.save();

        // Update order details
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $set: { "products.$[].items.$[item].display": false } },
            {
                new: true,
                arrayFilters: [{ "item.productId": productId }],
            }
        );

        const allProductsUpdated = updatedOrder.products.every(product =>
            product.items.every(item => !item.display)
        );

        if (allProductsUpdated) {
            updatedOrder.status = action === 'return' ? 'Returned' : 'Cancelled';
            await updatedOrder.save();
        }

        return { success: true, order: updatedOrder, message: `${action.charAt(0).toUpperCase() + action.slice(1)} product successfully.` };

    } catch (err) {
        console.error(`Error while ${action}ing the product:`, err);
        return { success: false, message: `An error occurred while ${action}ing the product.` };
    }
};


export const cancelProductInOrder = async (req, res) => {
    try {
        const { productId, orderId } = req.body;
console.log(req.body);

        if (!productId || !orderId) {
            return res.status(400).json({ success: false, message: "Order ID and Product ID are required." });
        }

        const result = await updateOrderAndProduct(orderId, productId, 'cancel', req.session.userId);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, message: result.message, order: result.order });

    } catch (err) {
        console.error("Error while canceling the product:", err);
        return res.status(500).json({ success: false, message: "An error occurred while canceling the product." });
    }
};

export const returnProductInOrder = async (req, res) => {
    console.log("Return pordut in order working", req.body);

    try {
        const { productId, orderId } = req.body;

        if (!productId || !orderId) {
            return res.status(400).json({ success: false, message: "Order ID and Product ID are required." });
        }

        const result = await updateOrderAndProduct(orderId, productId, 'return', req.session.userId);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, message: result.message, order: result.order });

    } catch (err) {
        console.error("Error while returning the product:", err);
        return res.status(500).json({ success: false, message: "An error occurred while returning the product." });
    }
};


// ---------------------------------------------------------------------------------------------------








// -------------Coupen applyed section--------------------------------------------------------



export const applyCoupon = async (req, res) => {
    try {

        const { couponcode, totalAmount } = req.body;
        const userId = req.session.userId
        const coupon = await Coupon.findOne({ couponId: couponcode })
        const user= await User.findById(userId)
        if (!coupon) {
            return res.status(400).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isActive || new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Coupon is expired or inactive' });
        }
        if (coupon.usedUsers.includes(userId)) {
            return res.status(400).json({ message: 'You have already used this coupon' });
        }
        if (totalAmount < coupon.minPurchaseAmount) {
            return res.status(400).json({ message: `Minimum purchase of ${coupon.minPurchaseAmount} required` });
        }
        let discountAmount = coupon.discount;
        if (coupon.maxAmount && discountAmount > coupon.maxAmount) {
            discountAmount = coupon.maxAmount;
        }
        const finalAmount = totalAmount - discountAmount;
        user.redeemed=couponcode
        user.save()
        // coupon.usedUsers.push(userId);
        // await coupon.save();
        return res.status(200).json({ message: 'Coupon applied successfully', finalAmount, discountAmount });

    } catch (err) {
        console.log("Error while apply the coupon", err);

    }
}


export const removeCoupon = async (req, res) => {
    try {
        const { couponcode, totalAmount } = req.body;
        const userId = req.session.userId;

        // Find the coupon
        const coupon = await Coupon.findOne({ couponId: couponcode });

        if (!coupon) {
            return res.status(400).json({ message: 'Invalid coupon code' });
        }

        // Check if the user has used this coupon
        if (!coupon.usedUsers.includes(userId)) {
            return res.status(400).json({ message: 'Coupon not applied or already removed' });
        }

        // Remove the user from the usedUsers list
        coupon.usedUsers = coupon.usedUsers.filter(user => user !== userId);
        await coupon.save();

        // Respond with success and optionally reset the amount
        return res.status(200).json({
            message: 'Coupon removed successfully',
            totalAmount: totalAmount // Resetting total amount as coupon discount is removed
        });
    } catch (err) {
        console.error('Error while removing the coupon', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




// --------------wallet payment order section---------------------




export const createWalletcheckout = async (req, res) => {
    try {
        const { selectedAddressId, totalAmount, products, paymentMethod } = req.body;
        console.log("Total amount", req.body);


        if (!req.session.userId || !req.session.user) {
            return res.status(400).json({
                status: "error",
                title: "Session Error",
                text: "Session has expired or is invalid.",
            });
        }

        let walletData = await Wallet.findOne({ user: req.session.userId });
        console.log("Wallet",walletData);

        if (!walletData) {


            walletData = new Wallet({
                user: req.session.userId,
                balance: 0,  
                transaction: []  
            });

            await walletData.save();

            console.log("New Wallet Created:", walletData);

        }

        if (totalAmount <= walletData.balance) {
            const orderId = uuidv4();
            const parsedProducts = JSON.parse(products);

            const productTitles = parsedProducts.flatMap(product =>
                product.items.map(item => item.title)
            );

            const newOrder = new Order({
                selectedAddressId,
                totalAmount,
                products: parsedProducts,
                paymentMethod,
                paymentStatus: "Paid",
                orderId,
                user: req.session.user
            });

            await newOrder.save();
            console.log("Successfully created an order", newOrder);

            walletData.balance -= totalAmount;
            walletData.transaction.push({
                amount: totalAmount,
                transactionId: `TXN${Date.now()}`,
                productName: productTitles,
                type: 'debit',
            });
            await walletData.save();

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


            const user= await User.findById(req.session.userId)
        
        if(user.redeemed){
         const coupon = await Coupon.findOne({couponId:user.redeemed})
         coupon.usedUsers.push(req.session.userId);
         console.log("coupon added successfully");
         
          await coupon.save();
          user.redeemed=null
          await user.save()
        }



            // Remove ordered items from the cart
            const userId = req.session.userId;
            const cart = await Cart.findOne({ userId });

            if (cart && Array.isArray(cart.items)) {
                const orderedProductIds = parsedProducts.flatMap(product =>
                    product.items.map(item => item.productId.toString())
                );

                cart.items = cart.items.filter(cartItem =>
                    !orderedProductIds.includes(cartItem.productId.toString())
                );

                await cart.save();
                console.log("Products removed from the cart");
            } else {
                console.log("Cart is either undefined or does not contain items");
            }

            console.log("Order created successfully.");
            res.redirect(`/ordersummery/${newOrder._id}`);

        } else {
            console.log("Insufficient wallet balance.");
            return res.status(400).json({
                status: "error",
                title: "Insufficient Balance",
                text: "You don't have enough balance in your wallet to complete this transaction.",
            });
        }

    } catch (err) {
        console.log("Error while trying to wallet payment", err);
        return res.status(500).json({
            status: "error",
            title: "Server Error",
            text: "An unexpected error occurred. Please try again later.",
        });
    }
};