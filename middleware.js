export const isUserNotAuth=(req,res,next)=>{
     if(req.session.user){
            res.redirect('/home')
     }else{
        next()
     }
}