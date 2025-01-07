import Product from "../../models/productModel.js";
import Cart from '../../models/cartModel.js'



export const getShopPage = async (req, res) => {
    try {
        const searchQuery = req.query.q; // Get the search query from the request
        let products;

        if (searchQuery) {
            // Search for products matching the query
            products = await Product.find({ 
                isActive: true, 
                title: { $regex: searchQuery, $options: 'i' } // Case-insensitive search
            });
        } else {
            // Fetch all active products if no search query is provided
            products = await Product.find({ isActive: true });
        }

        res.render('user/shop', { 
            user: req.session.user || null, 
            products, 
            searchQuery: searchQuery || '' // Pass the search query to the view
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

        const products = await Product.find({ isActive: true }).sort({ disPrice: -1 });

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



export const getWomenProducts = async (req, res) => {
    try {
        
        const womenProducts = await Product.find({ isActive: true, gender: 'women' })
            .sort({ createdAt: -1 });

        res.render('user/shop', { 
            user: req.session.user || null, 
            products: womenProducts 
        });
    } catch (err) {
        console.log("Error while fetching women's products", err);
        res.status(500).send("Error fetching women's products");
    }
};



export const getMenProducts = async (req, res) => {
    try {
        const menProducts = await Product.find({ isActive: true, gender: 'men' })
            .sort({ createdAt: -1 });

        res.render('user/shop', { 
            user: req.session.user || null, 
            products: menProducts 
        });
    } catch (err) {
        console.log("Error while fetching men's products", err);
        res.status(500).send("Error fetching men's products");
    }
};


export const getFeaturedProducts=async(req,res)=>{
    try{
        const featuredProducts=await Product.find({isActive:true})
        res.render('user/shop',{user:req.session.user || null , products:featuredProducts})
    }catch(err){
        console.log("Error while getting featured products",err);
        
    }
}






// ----------------Cart Section-------------------------------------------------

export const getCartPage = async (req, res) => {
    res.render('user/cart', { 
        user: req.session.user || null, 
        userCart: req.userCart || null ,
        cartPrice: req.cartPrice || { subtotal: 0, shippingCost: 0, total: 0, selectedShipping: 'free' },
        messages: req.flash() 
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


export const cartPriceList = async (req, res, next) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            console.log("User not logged in");
            req.cartPrice = null;
            return next();
        }

        const cart = await Cart.findOne({ userId: userId });

        if (!cart || !cart.items.length) {
            console.log("Cart is empty or invalid");
            req.cartPrice = { subtotal: 0, shippingCost: 0, total: 0, selectedShipping: 'free' };
            return next();
        }

        const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

       
        const shippingCosts = { free: 0, standard: 50, express: 100 };

        const selectedShipping = req.body.shipping || 'free';
        const shippingCost = shippingCosts[selectedShipping] || 0;

        const total = subtotal + shippingCost;

        req.cartPrice = { subtotal, shippingCost, total, selectedShipping };
        next();
    } catch (error) {
        console.error("Error fetching cart details:", error);
        req.cartPrice = null;
        next();
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
        
        
        const MAX_QUANTITY = 5;

        if (!req.session.user) {
            return res.redirect('/login'); 
        }

        const userId = req.session.userId; 
        const cart = await Cart.findOne({ userId: userId });
        const product = await Product.findById(productId);

        if (!cart) {
            return res.redirect('/cart');
        }

        const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (productIndex > -1) {
            const item = cart.items[productIndex];
            const availableStock = product.stock;
            const maxAllowedQuantity = Math.min(availableStock, MAX_QUANTITY); 
            
            if (action === 'increase') {
                
                if (item.quantity < maxAllowedQuantity) {
                    item.quantity += 1;
                } else {
                    req.flash('error', `You can only add up to ${maxAllowedQuantity} items for this product, based on the available stock.`);
                    return res.redirect('/cart');
                }
            } else if (action === 'decrease' && item.quantity > 1) {
                item.quantity -= 1;  
            }

            await cart.save();
        }

        return res.redirect('/cart');
    } catch (err) {
        console.error("Error while updating cart:", err);
        res.status(500).send("Internal Server Error");
    }
};





export const searchProduct=async(req,res,next)=>{
    try{
        const searchQuery = req.query.q; // Get the search term from query string
        console.log("Search Query:", searchQuery);

        if (!searchQuery) {

            return res.redirect('/shop');
        }

         req.products = await Product.find({
            title: { $regex: searchQuery, $options: 'i' } // Case-insensitive match
        });


            res.redirect('/shop')



    }catch(err){
        console.log("Error while trying to search products",err);
        
    }
}


