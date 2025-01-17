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
    const getDateRange = (unit) => ({
      start: moment().startOf(unit).toDate(),
      end: moment().endOf(unit).toDate(),
    });

    const allOrders = await Order.find({
      createdAt: { $gte: moment().startOf('year').toDate(), $lte: moment().endOf('year').toDate() }
    });

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

    req.salesChart = salesChartData;

    next();
  } catch (err) {
    console.log("Error while trying to get the sales chart", err);
    res.status(500).send("Error generating sales chart report");
  }
};


export const mostSoldProductsCatagorysAndBrands = async (req, res, next) => {
  try {
    const products = await Order.aggregate([
      // Unwind the products array
      { $unwind: "$products" },
      { $unwind: "$products.items" },

      // Group by productId and calculate total quantity sold
      {
        $group: {
          _id: "$products.items.productId", // Group by productId
          totalQuantity: { $sum: "$products.items.quantity" }, // Sum the quantity for each productId
          productDetails: { $first: "$products.items" }, // Get product details
        },
      },

      // Cast productId to ObjectId for matching with Product collection
      {
        $addFields: {
          productObjectId: {
            $toObjectId: "$_id", // Convert productId to ObjectId
          },
        },
      },

      // Join with Product collection to fetch brand and other product details
      {
        $lookup: {
          from: "products", // Collection name for Product
          localField: "productObjectId", // Field in this collection (converted productId)
          foreignField: "_id", // Field in Product collection
          as: "productInfo", // Output array field
        },
      },

      // Unwind productInfo to merge the details
      { $unwind: "$productInfo" },

      // Sort by totalQuantity in descending order
      { $sort: { totalQuantity: -1 } },

      // Project required fields
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          productDetails: 1,
          brand: "$productInfo.brand", // Include the brand name
          category: "$productInfo.category", // Include the category
          title: "$productInfo.title", // Include the product title
          price: "$productInfo.price", // Include the price
        },
      },
    ]);

    const categoriesDetails = products.reduce((acc, item) => {
      const { category, totalQuantity } = item;
      acc[category] = (acc[category] || 0) + totalQuantity;
      return acc;
    }, {});
    
    req.categoriesDetails=categoriesDetails

     req.mostSoldDetails=products
    

    next();
  } catch (err) {
    console.error("Error while getting the most sold products", err);
    res.status(500).json({
      success: false,
      message: "Error while retrieving products",
      error: err.message,
    });
  }
};
