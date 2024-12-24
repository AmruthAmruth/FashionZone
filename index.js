import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session'; // Add session middleware
import flash from 'express-flash';
import nocache from 'nocache';
import passport from 'passport';
import "./config/passportConfig.js"
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js'; 

dotenv.config();
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use("/static", express.static(path.join(__dirname, "public/assets")));
app.use("/assets", express.static(path.join(__dirname, "public/assets/images")));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache())
// Session middleware before flash
app.use(session({
  secret: process.env.SESSION_SECRET, // You should use a more secure secret
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize())
app.use(passport.session())
// Flash messages middleware
app.use(flash());


// Routes
app.use('/admin', adminRouter);
app.use('/', userRouter);


const PORT = process.env.PORT || 7000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Database Connected Successfully");
    app.listen(PORT, () => {
      console.log(`Server Running on Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });
