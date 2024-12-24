


export const getShopPage=(req,res)=>{
    res.render('user/shop',{ user: req.session.user || null })
}

export const getProduct=(req,res)=>{
    res.render('user/product',{user: req.session.user || null})
}