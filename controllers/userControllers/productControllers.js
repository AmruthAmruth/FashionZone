import Product from "../../models/productModel.js";
import Cart from '../../models/cartModel.js'

export const getShopPage = async (req, res) => {
    try {
       
        const products = await Product.find({ isActive: true });
      
       
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




export const getProductbyId = async (req, res) => {
    try {
        const id = req.params.id;
        const category = req.query.category;

        const item = await Product.findById(id);

        if (!item) {
            return res.redirect('/shop');
        }

        const relatedProducts = await Product.find({
            category: category, 
            _id: { $ne: id } 
        }).limit(5);

        console.log(relatedProducts);

       
        res.render('user/product', {
            product: item,
            relatedProducts, 
            user: req.session.user || null,
        });

    } catch (err) {
        console.error("Error while trying to get product by id:", err);
        res.status(500).send("Internal Server Error");
    }
};



// --------------Product sorted area----------------------------------------------


export const priceLowToHigh = async (req, res) => {
    try {
        console.log("low to high working");

        // Await the query to get products sorted by price in ascending order
        const products = await Product.find({ isActive: true }).sort({ disPrice: 1 });

        // Render the shop page with the sorted products
        
        res.render('user/shop', { 
            user: req.session.user || null, 
            products 
        });
    } catch (err) {
        console.log("Error while sorting", err);
        res.status(500).send("Internal Server Error");
    }
} 


export const priceHighToLow = async (req, res) => {
    try {
        console.log("high to low working");

        // Await the query to get products sorted by price in descending order
        const products = await Product.find({ isActive: true }).sort({ disPrice: -1 });

        // Render the shop page with the sorted products
        console.log(products);
        
        res.render('user/shop', { 
            user: req.session.user || null, 
            products 
        });
    } catch (err) {
        console.log("Error while sorting", err);
        res.status(500).send("Internal Server Error");
    } 
}

export const getNewArrivals = async (req, res) => {
    try {
        const newArrivals = await Product.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(10); 

        
        res.render('user/shop', { user:req.session.user || null, products: newArrivals });
    } catch (err) {
        console.log("Error while fetching new arrivals", err);
        res.status(500).send("Error fetching new arrivals");
    }
};



export const sortProducts = async (req, res) => {
    try {
        
        const sortOrder = req.query.sortOrder || 'asc'; 

        let sortCondition = {};
        if (sortOrder === 'asc') {
            sortCondition = { title: 1 };  
        } else if (sortOrder === 'desc') {
            sortCondition = { title: -1 }; 
        }

        
        const products = await Product.find({ isActive: true }).sort(sortCondition);

        
        res.render('user/shop', { user:req.session.user || null, products });
    } catch (err) {
        console.log("Error while sorting products alphabetically", err);
        res.status(500).send("Error sorting products");
    }
};

export const sortByAToZ = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ title: 1 });  // 1 for ascending (A to Z) order
        res.render('user/shop',  { user:req.session.user || null, products });
    } catch (err) {
        console.log("Error while sorting A to Z", err);
        res.status(500).send("Error fetching products");
    }
};



export const sortByZToA = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ title: -1 });  // -1 for descending (Z to A) order
        res.render('user/shop',  { user:req.session.user || null, products });
    } catch (err) {
        console.log("Error while sorting Z to A", err);
        res.status(500).send("Error fetching products");
    }
};




// ----------------Cart Section-------------------------------------------------

export const getCartPage = async (req, res) => {
    res.render('user/cart', { 
        user: req.session.user || null, 
        userCart: req.userCart || null 
    });
};





export const getUserCart = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');  
        }

        const userId = req.session.userId; 
       
        const cart = await Cart.findOne({ userId: userId });
         console.log("Cart",cart);
         
        if (!cart) {
            console.log("Cart is empty");
            req.userCart = null;  
            return next();  
        }

        
        req.userCart = cart;
        next(); 
    } catch (err) {
        console.error("Error while fetching user's cart:", err);
        res.status(500).send("Internal Server Error");
    }
};


export const addToCart = async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity) || 1;

        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const product = await Product.findById(productId);
        if (!product) {
            req.flash('message', "Product not found");
            return res.redirect('/cart');
        }

        let cart = await Cart.findOne({ userId: req.session.userId });

        if (!cart) {
            cart = new Cart({
                userId: req.session.userId,
                items: []
            });
        }

        const existingProductIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (existingProductIndex > -1) {
            cart.items[existingProductIndex].quantity += quantity;
        } else {
            cart.items.push({
                productId: product._id,
                image: product.images[0],
                title: product.title,
                price: product.disPrice || product.price,
                quantity: quantity
            });
        }

        await cart.save();

        console.log('cart added product',cart);

        return res.redirect('/cart');
    } catch (err) {
        console.error("Error while adding to cart:", err);
        res.status(500).send("Internal Server Error");
    }
};





export const removeFromCart = async (req, res) => {
    try {
        const productId = req.params.productId; 
        
        
        if (!req.session.user) {
            return res.redirect('/login'); 
        }

        const userId = req.session.userId; 

        
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.redirect('/cart'); 
        }

        const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (productIndex > -1) {
            cart.items.splice(productIndex, 1);

            await cart.save();
        }

        return res.redirect('/cart');
    } catch (err) {
        console.error("Error while removing item from cart:", err);
        res.status(500).send("Internal Server Error");
    }
};



export const updateCart = async (req, res) => {
    try {
        const productId = req.params.productId; 
        const action = req.body.action; 
        
        if (!req.session.user) {
            return res.redirect('/login'); 
        }

        const userId = req.session.userId; 

      
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            
            return res.redirect('/cart');
        }

        const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (productIndex > -1) {
           
            const product = cart.items[productIndex];

            if (action === 'increase') {
                product.quantity += 1; 
            } else if (action === 'decrease' && product.quantity > 1) {
                product.quantity -= 1; 
            }

           
            await cart.save();
        }

       
        return res.redirect('/cart');
    } catch (err) {
        console.error("Error while updating cart:", err);
        res.status(500).send("Internal Server Error");
    }
};
