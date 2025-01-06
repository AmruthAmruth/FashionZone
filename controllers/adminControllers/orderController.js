import mongoose from 'mongoose';
import Order from '../../models/orderModel.js'
import User from '../../models/userModel.js';
import Address from '../../models/addressModel.js';


export const getOrderList = async (req, res) => {
    try {
   
      const orders = await Order.find();
  
      const ordersWithUsers = await Promise.all(
        orders.map(async (order) => {
          if (mongoose.Types.ObjectId.isValid(order.user)) {
            const user = await User.findById(order.user);
            return { ...order.toObject(), user };
          }
          return { ...order.toObject(), user: null }; 
        })
      );
  
      res.render('admin/orderlist', { orders: ordersWithUsers }); 
    } catch (err) {
      console.log('Error while getting the order list', err);
      res.status(500).send('Internal Server Error');
    }
  };
  

  export const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;

        const orderDetails = await Order.findById(orderId);
        const userAddress = await Address.findById(orderDetails.selectedAddressId);

        console.log("Order Address", userAddress);
        console.log("Order Details", orderDetails);

        if (!orderDetails) {
            console.log("Order cannot be found");
            return res.status(404).send("Order not found");
        }

        res.render('admin/orderdetails', { order: orderDetails, address: userAddress });
    } catch (err) {
        console.error("Error while trying to get the order details:", err);
        res.status(500).send("Internal Server Error");
    }
};




export const changeTheOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body; 
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send("Order not found");
        }

        order.status = status;  
        await order.save();

        res.redirect(`/admin/orderdetails/${orderId}`);
    } catch (err) {
        console.log("Error while changing the order status:", err);
        res.status(500).send("Internal Server Error");
    }
};
