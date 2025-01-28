import Category from "../../models/categoryModel.js";



export const getCategoryPage=async(req,res)=>{

        try{
            const categories= await Category.find()
            if (!categories || categories.length === 0) {
                return res.render('admin/category', { categories: [], message: "No categories found" });
            }
            const message = "Category List";
            res.render('admin/category', { categories,message  });
            
        }catch(err){
            console.log("Error while tring to get the category page",err);

        }

}



export const createCategory = async (req, res) => {
    try {
      const { category, description } = req.body;
  
      // Check if both category and description are provided
      if (!category || !description) {
        return res.redirect('admin/categories');
      }
  
      // Check if the category already exists (case-insensitive check)
      const existingCategory = await Category.findOne({
        category: { $regex: new RegExp(`^${category}$`, 'i') }
      });
  
      if (existingCategory) {
        // If category exists (case-insensitive), redirect back with an error message
        return res.redirect('admin/categories');
      }
  
      // If no existing category, create a new one
      const newCategory = new Category({
        category,
        description
      });
  
      await newCategory.save();
      res.redirect('/admin/categories');
  
    } catch (err) {
      console.log("Error while trying to add category", err);
    }
  }
  


export const editCategory=async(req,res)=>{
    try{
        const categoryId = req.params.id; 
        const { category, description } = req.body; 
        const categoryToUpdate = await Category.findById(categoryId);

        categoryToUpdate.category = category;
        categoryToUpdate.description = description;

        await categoryToUpdate.save();

        res.redirect('/admin/categories'); 

    }catch(err){
        console.log("Error while tring to edit the category");
        res.redirect('/admin/categories'); 
        
    }
}




export const showAndHideCategory=async(req,res)=>{
    try{

        const categoryId = req.params.id; 
    const category = await Category.findById(categoryId);

    category.isListed = !category.isListed;

    await category.save(); 
    res.redirect('/admin/categories');

    }catch(err){
        console.log("Error while tring to hide or show the catogory");
        
    }
}