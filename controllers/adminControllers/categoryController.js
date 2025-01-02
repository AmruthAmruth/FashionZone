import categoryModel from "../../models/categoryModel.js";



export const getCategoryPage=async(req,res)=>{
    res.render('admin/category')
}


export const  addCategory=async(req,res)=>{
    try{
           const {category,description}=req.body
           const lowerCaseCategory = category.toLowerCase();
           const existingCategory = await Category.findOne({ category: new RegExp(`^${lowerCaseCategory}$`, 'i') });

           if(existingCategory){
            req.flash('error','already exists a category with this name')
            res.redirect('/admin/addcategory')
    }else{
        const category = new categoryModel({
            category:category,
            description,

        })
        console.log("New Category added Successfully");
        
    await category.save();
    res.redirect('/admin/category')
    }


    }catch(err){
        console.log("Error while adding new category",err);
        
    }
}