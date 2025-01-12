import mongoose from "mongoose";
import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";



export const getAddProductPage = (req, res) => {
    console.log(req.categoryname); 
    
    res.render('admin/addproduct', {
        messages: {
            message: req.flash('message'),
            price: req.flash('price'),
            disPrice: req.flash('disPrice'),
            tags: req.flash('tags'),
            image: req.flash('image'),
            success: req.flash('success')
        },
        categories: req.categoryname 
    });
};


export const getAllProductPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const productsPerPage = 6; 

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / productsPerPage); 

        
        const products = await Product.find()
            .skip((page - 1) * productsPerPage) 
            .limit(productsPerPage); 

        
        res.render('admin/products', { 
            products, 
            message: req.flash(),
            currentPage: page, 
            totalPages,
            productsPerPage 
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching products");
    }
};



export const addProduct = async (req, res) => {
    try {
        const { brand, title, price, disPrice, color, size, category, stock, isActive, description, gender, tags } = req.body;
   console.log(color);
   
        if (!brand || !title || !price || !color || !size || !category || !stock || !description || !gender) {
            req.flash('message', 'All fields are required');
            return res.redirect('/admin/addproduct');
        }

        if (price <= 0) {
            req.flash('price', 'Price must be a positive number.');
            return res.redirect('/admin/addproduct');
        }

        if (disPrice && disPrice <= 0) {
            req.flash('disPrice', 'Discount price must be a positive number.');
            return res.redirect('/admin/addproduct');
        }

       

        if (!req.files || req.files.length < 4) {
            req.flash('image', 'Upload 4 images');
            console.log("This will work");
            return res.redirect('/admin/addproduct');
        }

        if (!tags) {
            req.flash('tags', 'Add tags in this field');
        }

        const imagePaths = req.files.map(file => file.path);

        const newProduct = new Product({
            brand, title, price, disPrice, color, size, category, stock, isActive, description, gender, tags, images: imagePaths
        });

        await newProduct.save();
        console.log("Product added successfully");
        req.flash('success', "Product Added Successfully");
        return res.redirect('/admin/addproduct');

    } catch (err) {
        console.log("Error while trying to add product", err);
        req.flash('message', 'An error occurred while adding the product');
        return res.redirect('/admin/addproduct');
    }
};


export const getCategory = async (req, res, next) => {
    try {
        const categories = await Category.find({isListed:true});  
        console.log(categories);

       
        req.categoryname = categories.map(cat => cat.category);

        next();
    } catch (err) {
        console.log("Error while getting the Category name", err);
        res.redirect('/admin/addproduct');
    }
};



export const getUpdateProductPage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log("Invalid product ID");
            return res.redirect('/admin/products');
        }

       
        const product = await Product.findById(id);

        if (!product) {
            console.log("Product not found");
            return res.redirect('/admin/products');
        }

        res.render('admin/updateproduct', { 
            product, 
            messages: {
                message: req.flash('message'),
                price: req.flash('price'),
                disPrice: req.flash('disPrice'),
                tags: req.flash('tags'),
                image: req.flash('image'),
            },
        });
        
       
        
    } catch (err) {
        console.error("Error while trying to get updateProduct page", err);
        res.status(500).send("An error occurred while retrieving the product.");
    }
};



export const updateProduct = async (req, res) => {
    try {
        const { 
            brand, 
            title, 
            price, 
            disPrice, 
            color, 
            size, 
            category, 
            stock, 
            isActive, 
            description, 
            gender, 
            tags 
        } = req.body;
        const productId = req.params.id;

        if (!brand || !title || !price || !color || !size || !category || !stock || !description || !gender) {
            req.flash('message', 'All fields are required');
            return res.redirect(`/admin/updateproduct/${productId}`);
        }

        if (price <= 0) {
            req.flash('price', 'Price must be a positive number.');
            return res.redirect(`/admin/updateproduct/${productId}`);
        }
        if (disPrice && disPrice <= 0) {
            req.flash('disPrice', 'Discount price must be a positive number.');
            return res.redirect(`/admin/updateproduct/${productId}`);
        }

        if (!tags || tags.length === 0) {
            req.flash('tags', 'Add tags in this field');
            return res.redirect(`/admin/updateproduct/${productId}`);
        }

        const uploadedFiles = req.files || [];
        const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages].filter(Boolean);

        const imagePaths = [...existingImages];
        uploadedFiles.forEach((file) => {
            imagePaths.push(file.path); 
        });

        
        if (imagePaths.length !== 4) {
            req.flash('image', 'You must have exactly 4 images.');
            return res.redirect(`/admin/updateproduct/${productId}`);
        }

        
        const updatedProductData = {
            brand,
            title,
            price,
            disPrice,
            color,
            size,
            category,
            stock,
            isActive,
            description,
            gender,
            tags,
            images: imagePaths
        };

        
        const product = await Product.findByIdAndUpdate(productId, updatedProductData, { new: true, runValidators: true });

        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/admin/products');
        }

        console.log('Product updated successfully');
        return res.redirect('/admin/products');
    } catch (err) {
        console.error('Error while updating the product:', err);
        req.flash('error', 'Something went wrong while updating the product.');
        return res.redirect(`/admin/updateproduct/${req.params.id}`);
    }
};


export const deleteProduct=async(req,res)=>{
    try {
        const productId = req.params.id; 
        const product = await Product.findById(productId);

        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/admin/products');
        }

        
        product.isActive = !product.isActive;
        await product.save(); 
       
        const message = product.isActive ? 'Product listed successfully' : 'Product unlisted successfully';
        req.flash('success', message);

        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while updating the product');
        res.redirect('/admin/products');
    }
}