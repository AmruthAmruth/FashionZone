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
    category: { $exists: true, $not: { $size: 0 } } // category is an array and is not empty
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

        if (!offerName || !description || !discount || !products || !status) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        if (discount < 0 || discount > 100) {
            return res.status(400).json({ message: "Discount should be between 0 and 100!" });
        }

        const productIds = products.map(productId => new mongoose.Types.ObjectId(productId));

        const foundProducts = await Product.find({ '_id': { $in: productIds } });

        // Correctly map product titles to productNames
        const productName = foundProducts.map(pro => pro.title);

        // Decrease the disPrice by the discount percentage
        foundProducts.forEach(product => {
            product.disPrice = product.price - (product.price * (discount / 100));
        });

        // Save all the modified products
        await Promise.all(foundProducts.map(product => product.save()));

        // Create a new offer with the product names and other details
        const newOffer = new Offer({
            offerName,
            description,
            discount,
            productName, // Use the correct variable name 'productNames'
            products: productIds,
            status
        });
        await newOffer.save();
console.log(newOffer);

        console.log("Discount added successfully");

        res.redirect('/admin/offers');

    } catch (err) {
        console.log("Error during adding offer for products", err);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const editOfferForProduct=async(req,res)=>{
    try{ 
        const { offerId, offerName, description, discount, products, status } = req.body;
        console.log("Is working now",req.body);
        
        if (!offerId || !offerName || !description || !discount || !products || !status) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        if (discount < 0 || discount > 100) {
            return res.status(400).json({ message: "Discount should be between 0 and 100!" });
        }

        const productIds = products.map(productId => new mongoose.Types.ObjectId(productId));

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found!" });
        }

        const foundProducts = await Product.find({ '_id': { $in: productIds } });

        const productName = foundProducts.map(pro => pro.title);

        foundProducts.forEach(product => {
            product.disPrice = product.price - (product.price * (discount / 100));
        });

        await Promise.all(foundProducts.map(product => product.save()));

        offer.offerName = offerName;
        offer.description = description;
        offer.discount = discount;
        offer.productName = productName; // Update product names
        offer.products = productIds;
        offer.status = status;

        await offer.save();

        console.log("Offer updated successfully");
        res.redirect('/admin/offers');

    }catch(err){
        console.log("Error while edit offer for products",err);
        
    }
}


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
            product.disPrice = product.price; // Reset the discount price to the original price
            product.save(); // Save the updated product
        });

        await Offer.deleteOne({ _id: offerId });
        console.log("Offer deleted successfully");

        // Redirect or send a response
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

        // Find products based on the categories
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








export const getCategoryOffer=async(req,res)=>{
  try{
    const category=await Category.find()
    const categorylist= category.map((cat)=>cat.category)

    const categoryOffer = await Offer.find({
        category: { $exists: true, $not: { $size: 0 } } // category is an array and is not empty
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
            product.disPrice = product.price; // Reset discounted price to original
            await product.save(); // Save each product document
        }

        await Offer.deleteOne({ _id: offerId });
        console.log("Offer deleted successfully");

        // Redirect to the admin offers page
        res.redirect('/admin/categoryoffer');
    } catch (err) {
        console.log("Error while deleting category offer", err);
        res.status(500).json({ message: "An error occurred while deleting the offer" });
    }
};
