import mongoose from 'mongoose';
import Order from '../../models/orderModel.js'
import User from '../../models/userModel.js';
import Address from '../../models/addressModel.js';
import moment from 'moment';



export const getOrderList = async (req, res) => {
    try {
   
      const orders = await Order.find().sort({createdAt:-1});
  
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



export const getSalesChartReport = async (req, res, next) => {
  try {
    // Helper function to get start and end dates
    const getDateRange = (unit) => ({
      start: moment().startOf(unit).toDate(),
      end: moment().endOf(unit).toDate(),
    });

    // Fetch all orders within the yearly range
    const allOrders = await Order.find({
      createdAt: { $gte: moment().startOf('year').toDate(), $lte: moment().endOf('year').toDate() }
    });

    // Create a function to count orders based on status and date range
    const getOrdersCountByStatus = (orders, status, startDate, endDate) => {
      return orders.filter(order => 
        order.status === status && 
        moment(order.createdAt).isBetween(startDate, endDate, null, '[]')
      ).length;
    };

    // Weekly sales report
    const weeklyRange = getDateRange('week');
    const weeklyPending = getOrdersCountByStatus(allOrders, 'Pending', weeklyRange.start, weeklyRange.end);
    const weeklyDelivered = getOrdersCountByStatus(allOrders, 'Delivered', weeklyRange.start, weeklyRange.end);
    const weeklyCancelled = getOrdersCountByStatus(allOrders, 'Cancelled', weeklyRange.start, weeklyRange.end);

    // Monthly sales report
    const monthlyRange = getDateRange('month');
    const monthlyPending = getOrdersCountByStatus(allOrders, 'Pending', monthlyRange.start, monthlyRange.end);
    const monthlyDelivered = getOrdersCountByStatus(allOrders, 'Delivered', monthlyRange.start, monthlyRange.end);
    const monthlyCancelled = getOrdersCountByStatus(allOrders, 'Cancelled', monthlyRange.start, monthlyRange.end);

    // Yearly sales report
    const yearlyRange = getDateRange('year');
    const yearlyPending = getOrdersCountByStatus(allOrders, 'Pending', yearlyRange.start, yearlyRange.end);
    const yearlyDelivered = getOrdersCountByStatus(allOrders, 'Delivered', yearlyRange.start, yearlyRange.end);
    const yearlyCancelled = getOrdersCountByStatus(allOrders, 'Cancelled', yearlyRange.start, yearlyRange.end);

    // Prepare data for the response
    const salesChartData = {
      total: {
        pendingProducts: await Order.find({ status: "Pending" }).countDocuments(),
        deliveredProducts: await Order.find({ status: "Delivered" }).countDocuments(),
        cancelledProducts: await Order.find({ status: "Cancelled" }).countDocuments(),
      },
      weekly: {
        pendingProducts: weeklyPending,
        deliveredProducts: weeklyDelivered,
        cancelledProducts: weeklyCancelled,
      },
      monthly: {
        pendingProducts: monthlyPending,
        deliveredProducts: monthlyDelivered,
        cancelledProducts: monthlyCancelled,
      },
      yearly: {
        pendingProducts: yearlyPending,
        deliveredProducts: yearlyDelivered,
        cancelledProducts: yearlyCancelled,
      },
    };

    // Attach the sales chart data to the request object for use in the next middleware or route
    req.salesChart = salesChartData;

    // Proceed to the next middleware (or render the view)
    next();
  } catch (err) {
    console.log("Error while trying to get the sales chart", err);
    res.status(500).send("Error generating sales chart report");
  }
};
