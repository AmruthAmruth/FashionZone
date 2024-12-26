import Product from "../../models/productModel.js";


export const getShopPage = async (req, res) => {
    try {
       
        const products = await Product.find({ isActive: true });
       console.log(products);
       
        res.render('user/shop', { 
            user: req.session.user || null, 
            products 
        });
    } catch (error) {
        console.error('Error fetching products:', error);

        res.status(500).send('An error occurred while fetching products');
    }
};



export const getProduct=(req,res)=>{
    res.render('user/product')
}


export const getProductbyId=async(req,res)=>{
    try{
        const id=req.params.id
        const item=await Product.findById(id)
        console.log(item);
        
        if (!item) {
            return res.redirect('/shop');
        }
        res.render('user/product',{product:item, user: req.session.user || null,})

    }catch(err){
        console.log("Error while trying to get product by id");
        
    }
}