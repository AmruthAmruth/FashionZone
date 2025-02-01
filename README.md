# FashionZone 🛍️


FashionZone is a full-stack e-commerce platform for fashion enthusiasts, featuring a robust admin dashboard and a user-friendly shopping experience.
Built with **EJS** (server-side rendering), **Bootstrap**, **Node.js**, and **MongoDB**, and deployed on AWS.




## 🌟 Features

### **Admin Panel**
- **Secure Session-Based Auth**: Admin login with role validation.
- **User Management**: Block/unblock users, view activity logs.
- **Category/Product CRUD**: Soft delete for categories/products, multi-image upload (auto-cropped with Sharp).
- **Order Management**: Update order statuses, handle cancellations.
- **Sales Reports**: Generate PDF/Excel reports for daily/weekly/yearly sales.
- **Coupons & Offers**: Create category/product-specific discounts.
- **Dashboard Analytics**: Visualize sales trends, top-selling products, and revenue metrics.

### **User Side**
- **Auth & Security**:
  - OTP-based signup with resend timer ⏳
  - Google/Facebook SSO (Passport.js integration)
  - Forgot password flow with email verification
- **Shopping Features**:
  - Product listings with filters (price, popularity, ratings)
  - Advanced search with category sorting
  - Product details with image zoom, stock alerts, and specs
- **Cart & Checkout**:
  - Stock-aware quantity limits 🛒
  - Multiple address management
  - COD/Razorpay payments (with failed payment recovery)
- **Profile Management**:
  - Order history with cancellation/return options
  - Wishlist & wallet for refunds
  - Address CRUD operations

### **Additional Features**
- **Error Handling**: Friendly UI messages for stockouts, payment failures, and invalid OTP.
- **Responsive Design**: Mobile-first Bootstrap layouts for all pages.
- **Inventory Alerts**: Highlight low-stock items on admin/product pages.

---

## 🛠️ Tech Stack
- **Frontend**: EJS (Templating Engine), Bootstrap 5, JavaScript, AJAX
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Sessions
- **Payment Integration**: Razorpay SDK
- **Image Processing**: Sharp (for cropping/resizing)
- **Authentication**: Passport.js (Google/Facebook OAuth), Nodemailer (OTP)
- **Deployment**: AWS EC2, S3 (Image Storage), MongoDB Atlas

---



