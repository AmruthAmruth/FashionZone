
import Admin from '../../models/adminModel.js'
import bcrypt from 'bcryptjs'



// ---------------- Admin Authentication------------------------------


export const getLoginPage=async(req,res)=>{
  res.render('admin/login', {
    messages: {
      message: req.flash('message'),
      email: req.flash('email'),
      password: req.flash('password'),
    },
  });
}

export const createAccount = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

   
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Account already exists. Please log in." });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    
    const newAdmin = new Admin({
      name,
      email,
      password: hashPassword,
    });

    
    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      admin: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email },
    });
  } catch (err) {
    console.error("Create Account error:", err);

  
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the account. Please try again later.",
    });
  }
};


export const AdminLogin = async (req, res) => {
  try {

    const { email, password } = req.body;
    console.log(req.body);

   
    if (!email || !password) {
      req.flash('message', 'Invalid credentials');
      return res.redirect('/admin');
    }

    const existingAdmin = await Admin.findOne({ email });
    if (!existingAdmin) {
      req.flash('email', 'Email does not exist.');
      return res.redirect('/admin');
    }

  
    const isMatch = await bcrypt.compare(password, existingAdmin.password);
    if (!isMatch) {
      req.flash('password', 'Incorrect Password');
      return res.redirect('/admin');
    }
      req.session.admin=existingAdmin.email
    console.log('Admin logged in successfully');
    return res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Error while admin login:', err);
    req.flash('message', 'Something went wrong. Please try again later.');
    return res.redirect('/admin');
  }
};


export const AdminLogout=async(req,res)=>{
  try{
    console.log(req.session.admin);
    
        req.session.destroy((err)=>{
          if(err){
            console.log("Error while session destroyed");
            return res.redirect('/')
            
          }
          console.log("Session destroyed successfully");
          return res.redirect('/')
          
        })
  }catch(err){
    console.log("Error during logout",err);
    
  }
}




export const AdminDashboard = async (req, res) => {
  const salseChart = req.salesChart;  
  const categoriesDetails= req.categoriesDetails
 
 const mostSoldDetails=req.mostSoldDetails
  if (!salseChart) {
    return res.status(500).send("Sales chart data is missing.");
  }
  
  res.render('admin/dashboard', { salseChart ,mostSoldDetails,categoriesDetails});
};