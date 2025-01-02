

export const isUserAuthenticated=(req,res,next)=>{
    if(req.session.user){
        res.redirect('/')
    }
    next()
}


export const isAdminAuthenticated=(req,res,next)=>{
         if(req.session.admin){
        res.redirect('/admin/dashboard')
         }
         next()
}

export const adminAutherization=(req,res,next)=>{
           if(!req.session.admin){
              res.redirect('/admin')
           }
           next()

}