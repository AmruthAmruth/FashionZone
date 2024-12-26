import User  from "../../models/userModel.js";




export const getUserListPage=async(req,res)=>{
    try{
        const users = await User.find();
        res.render('admin/userlist',{users,message:req.flash()})
    }catch(err){
        console.log(err);
        
    }
}



export const blockAndUnblock=async(req,res)=>{
    try {
        const userid = req.params.id; 
        const user = await User.findById(userid);

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/userlist');
        }

        
        user.isActive = !user.isActive;
        await user.save(); 
       
        const message = user.isActive ? 'User unblocked successfully' : 'User Blocked successfully';
        req.flash('success', message);

        res.redirect('/admin/userlist');
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while updating the product');
        res.redirect('/admin/userlist');
    }
}

