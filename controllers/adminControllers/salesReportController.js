import Order from "../../models/orderModel.js";


export const getSalesReportPage = async (req, res) => {
    try {
      const { startDate, endDate, filter, page = 1, limit = 10 } = req.query;
  
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
  
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
  
      const query = { status: 'Delivered' };
  
      if (start && end) {
        query.createdAt = { $gte: start, $lte: end };
      } else if (filter) {
        const now = new Date();
  
        switch (filter) {
          case 'daily':
            
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            query.createdAt = { $gte: startOfDay, $lte: new Date() };
            break;
          case 'weekly':
            query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
            break;
          case 'monthly':
            query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
            break;
          case '1year':
            query.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
            break;
          default:
            break;
        }
      }
  
      const skip = (pageNum - 1) * limitNum;
  
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
  
      const totalOrders = await Order.countDocuments(query);
  
      const salesData = orders.flatMap(order =>
        order.products.flatMap(product =>
          product.items.map(item => ({
            orderId: order.orderId,
            date: order.createdAt,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            total: (item.price * item.quantity).toFixed(2),
            totalAmount: order.totalAmount,
            discount: ((item.price * item.quantity) - order.totalAmount).toFixed(2),
            netTotal: (
              item.price * item.quantity -
              (order.discount || 0) -
              (order.couponDeduction || 0)
            ).toFixed(2),
          }))
        )
      );
  
      const totals = salesData.reduce((acc, item) => {
        acc.totalDiscount += parseFloat(item.discount); // Sum up the discount
        acc.totalAmount += parseFloat(item.totalAmount); // Sum up the totalAmount
        return acc;
      }, { totalDiscount: 0, totalAmount: 0 });
  
      const pagination = {
        currentPage: pageNum,
        totalPages: Math.ceil(totalOrders / limitNum),
        totalItems: totalOrders,
        hasNextPage: pageNum * limitNum < totalOrders,
        hasPrevPage: pageNum > 1,
      };
  
      res.render('admin/salesreport', { salesData, orders, pagination, limit: limitNum, totalOrders, totals });
    } catch (err) {
      console.log('Error while trying to get the sales report page', err);
      res.status(500).json({ message: 'An error occurred while fetching the sales report' });
    }
  };