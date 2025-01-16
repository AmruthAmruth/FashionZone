import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session'; 
import flash from 'express-flash';
import nocache from 'nocache';
import passport from 'passport';
import "./config/passportConfig.js"
import methodOverride from 'method-override'
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js'; 
import bodyParser from 'body-parser';

dotenv.config();
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true })); 

app.use("/static", express.static(path.join(__dirname, "public/assets")));
app.use("/assets", express.static(path.join(__dirname, "public/admin/assets")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache())



app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize())
app.use(passport.session())


app.use(flash());



app.use('/admin', adminRouter);
app.use('/', userRouter);
app.use('*', (req, res) => {
  res.status(404).render('partials/error'); 
});


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
