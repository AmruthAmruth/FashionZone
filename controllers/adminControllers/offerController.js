import mongoose from "mongoose";
import Offer from "../../models/offerModel.js";
import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";


export const getOfferPage = async (req, res) => {
    try {
        const products = await Product.find({}, 'title _id');
        const offers = await Offer.find({ category: { $size: 0 } });

        const category=await Category.find()
       const productIds = offers.flatMap(offer => offer.products);
       const offerProduct = await Product.find({
        _id: { $in: productIds }  
      });
      const titles = offerProduct.map(product => product.title)
      const categorylist= category.map((cat)=>cat.category) 



const categoryOffer = await Offer.find({
    category: { $exists: true, $not: { $size: 0 } }
});



        res.render('admin/offer', { products, offers,titles,categorylist,categoryOffer });
    } catch (err) {
        console.error("Error while trying to get offer page", err);
    }
};



export const addOfferForProduct = async (req, res) => {
    try {
        const { offerName, description, discount, products, status } = req.body;
        console.log(req.body);
        const productsArray = Array.isArray(products) ? products : [products];
        
        if (!Array.isArray(productsArray)) {
            return res.status(400).json({ message: "'products' should be an array" });
        }

        if (!offerName || !description || !discount || !productsArray || !status) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        if (discount < 0 || discount > 100) {
            return res.status(400).json({ message: "Discount should be between 0 and 100!" });
        }

        const productIds = productsArray.map(productId => new mongoose.Types.ObjectId(productId));

        const foundProducts = await Product.find({ '_id': { $in: productIds } });

        if (foundProducts.length !== productIds.length) {
            return res.status(400).json({ message: "Some products were not found!" });
        }

        const productName = foundProducts.map(pro => pro.title);

        foundProducts.forEach(product => {
            product.disPrice = product.price - (product.price * (discount / 100));
        });

        await Promise.all(foundProducts.map(product => product.save()));

        const newOffer = new Offer({
            offerName,
            description,
            discount,
            productName,
            products: productIds,
            status: status 
        });

        await newOffer.save();
        console.log(newOffer);

        console.log("Discount added successfully");

        return res.redirect('/admin/offers');

    } catch (err) {
        console.log("Error during adding offer for products", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const updateProductOfferStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Offer ID is required!" });
        }

        const offer = await Offer.findById(id).populate('products');
        if (!offer) {
            return res.status(404).json({ message: "Offer not found!" });
        }

        offer.status = offer.status === 'Active' ? 'Inactive' : 'Active'; 
        await offer.save();

        if (offer.status === 'Inactive' && offer.products) {
            for (const product of offer.products) {
                product.disPrice = product.price; 
                await product.save();
            }
        }

        res.json({ message: 'Offer status updated successfully', status: offer.status });
    } catch (err) {
        console.error("Error while updating the status:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};






export const editOfferForProduct = async (req, res) => {
    try {
        console.log(req.body);
        
        console.log("Request received to edit offer:", req.body);

        const { offerId, offerName, description, discount, products, status } = req.body;

        if (!offerId || !offerName || !description || !discount || !products || !status) {
            console.log("Validation failed: Missing fields.");
            return res.status(400).json({ message: "All fields are required!" });
        }
        if (!Array.isArray(products) || products.length === 0) {
            console.log("Validation failed: Products field is not a non-empty array.");
            return res.status(400).json({ message: "Products field should be a non-empty array!" });
        }
        if (discount < 0 || discount > 100) {
            console.log("Validation failed: Invalid discount value.");
            return res.status(400).json({ message: "Discount should be between 0 and 100!" });
        }

        const productIds = products.map(productId => new mongoose.Types.ObjectId(productId));

        const offer = await Offer.findById(offerId);
        if (!offer) {
            console.log("Offer not found for ID:", offerId);
            return res.status(404).json({ message: "Offer not found!" });
        }

        const foundProducts = await Product.find({ '_id': { $in: productIds } });
        console.log("Found products:", foundProducts);

        if (foundProducts.length !== productIds.length) {
            console.log("Mismatch in product IDs. Some products not found.");
            return res.status(400).json({ message: "Some products were not found!" });
        }

        foundProducts.forEach(product => {
            console.log("Updating discount for product:", product._id);
            product.disPrice = product.price - (product.price * (discount / 100));
        });

        const updatedProducts = await Promise.all(foundProducts.map(product => product.save()));

        if (updatedProducts.length === 0) {
            console.log("No products updated with the discount.");
        }

        offer.offerName = offerName;
        offer.description = description;
        offer.discount = discount;
        offer.productName = foundProducts.map(pro => pro.title);
        offer.products = productIds;
        offer.status = status; 
        console.log("Saving updated offer...");
        await offer.save();

        console.log("Offer updated successfully");
       res.redirect('/admin/offers')

    } catch (err) {
        console.error("Error while editing offer for products:", err);
        return res.status(500).json({ message: "An internal error occurred. Please try again later." });
    }
};




export const deleteProductOffer=async(req,res)=>{
    try{
        const { offerId } = req.body;
        if (!offerId) {
            return res.status(400).json({ message: "Offer ID is required!" });
        }
        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found!" });
        }

        const productIds = offer.products;
        const products = await Product.find({ '_id': { $in: productIds } });

        products.forEach(product => {
            product.disPrice = product.price; 
            product.save(); 
        });

        await Offer.deleteOne({ _id: offerId });
        console.log("Offer deleted successfully");

        res.status(200).json({ message: "Offer deleted and products updated successfully!" });
    

    }catch(err){
        console.log("Error while trying to delete teh offer",err);
        
    }
}





export const addOfferForCategory = async (req, res) => {
    try {
        const { offerName, description, discount, categories, status } = req.body;

        if (!offerName || !description || !discount || !categories || !status) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        if (discount < 0 || discount > 100) {
            return res.status(400).json({ message: "Discount should be between 0 and 100!" });
        }

        const categoriesArray = Array.isArray(categories) ? categories : [categories];

        const products = (
            await Promise.all(
                categoriesArray.map((cate) => Product.find({ category: cate, isActive: true }))
            )
        ).flat();

        products.forEach(product => {
            product.disPrice = product.price - (product.price * (discount / 100));
        });


        await Promise.all(products.map(product => product.save()));

        const newOffer = new Offer({
            offerName,
            description,
            discount,
            category:categories,
            status
        });
        await newOffer.save();
        console.log("Discount added successfully on category based products",newOffer);


      return res.redirect('/admin/offers')

    } catch (err) {
        console.log("Error while trying to add category offer", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const updateCategoryOfferStatus = async (req, res) => {
    try {
        const { id, status } = req.body;

        if (!id || !status) {
            return res.status(400).json({ success: false, message: "Invalid request parameters." });
        }

        const offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).json({ success: false, message: "Offer not found." });
        }

        offer.status = status;

        if (status === 'Inactive') {
            const products = await Product.find({ category: { $in: offer.category } });
            for (let product of products) {
                product.disPrice = product.price; 
                await product.save();
            }
        }

        await offer.save();

        res.json({ success: true, message: `Offer status updated to ${status}.` });
    } catch (err) {
        console.error("Error updating category offer status:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};




export const getCategoryOffer=async(req,res)=>{
  try{
    const category=await Category.find()
    const categorylist= category.map((cat)=>cat.category)

    const categoryOffer = await Offer.find({
        category: { $exists: true, $not: { $size: 0 } } 
    });
    console.log(categoryOffer);

    
    res.render('admin/categoryoffer',{categorylist,categoryOffer})

  }catch(err){
    console.log("Error while trying to get category offer page",err);
    
  }
}


export const editCategoryOffer=async(req,res)=>{
    try{
        const { offerId, offerName, description, discount, categories, status } = req.body;

console.log(req.body);

        if (!offerId || !offerName || !description || !discount || !categories || !status) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        if (discount < 0 || discount > 100) {
            return res.status(400).json({ message: "Discount should be between 0 and 100!" });
        }

        const categoriesArray = Array.isArray(categories) ? categories : [categories];

        const offer = await Offer.findById(offerId);

        const products= await Product.find({
            $or: categoriesArray.map(category => ({ category: category }))
          })


          products.forEach(product => {
            product.disPrice = product.price - (product.price * (discount / 100));
        });

       const updatedProduct= await Promise.all(products.map(product => product.save()));

  
       
       offer.offerName = offerName;
        offer.description = description;
        offer.discount = discount;
        offer.category = categories; 
        offer.status = status;

        await offer.save();
        
        console.log("Category based offer updated");
        res.redirect('/admin/categoryoffer')
          
    }catch(err){
        console.log("Error while editing the category offer",err);
        
    }
}


export const deleteCategoryOffer = async (req, res) => {
    try {
        const { offerId } = req.body;

        if (!offerId) {
            return res.status(400).json({ message: "Offer ID is required!" });
        }

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found!" });
        }

        const categories = offer.category;
        const products = await Product.find({ category: { $in: categories } });

        for (const product of products) {
            product.disPrice = product.price; 
            await product.save(); 
        }

        await Offer.deleteOne({ _id: offerId });
        console.log("Offer deleted successfully");

        res.redirect('/admin/categoryoffer');
    } catch (err) {
        console.log("Error while deleting category offer", err);
        res.status(500).json({ message: "An error occurred while deleting the offer" });
    }
};
