import Category from "../../models/categoryModel.js";



export const getCategoryPage=async(req,res)=>{

        try{
            const categories= await Category.find()
            if (!categories || categories.length === 0) {
                return res.render('admin/category', { categories: [], message: req.flash() });
            }
            const message = "Category List";
            res.render('admin/category', { categories, message: req.flash() });
            
        }catch(err){
            console.log("Error while trying to get the category page", err);
            req.flash('error', 'Failed to load categories');
            res.render('admin/category', { categories: [], message: req.flash() });
        }

}



export const createCategory = async (req, res) => {
    try {
      const { category, description } = req.body;
  
      // Check if both category and description are provided
      if (!category || !description) {
        req.flash('error', 'Category name and description are required');
        return res.redirect('/admin/categories');
      }
  
      const existingCategory = await Category.findOne({
        category: { $regex: new RegExp(`^${category}$`, 'i') }
      });
  
      if (existingCategory) {
        req.flash('error', 'Category already exists');
        return res.redirect('/admin/categories');
      }
  
      const newCategory = new Category({
        category,
        description
      });
  
      await newCategory.save();
      req.flash('success', 'Category added successfully');
      res.redirect('/admin/categories');
  
    } catch (err) {
      console.log("Error while trying to add category", err);
      req.flash('error', 'Failed to add category');
      res.redirect('/admin/categories');
    }
  }
  


export const editCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { category, description } = req.body;

        if (!category || !description) {
            req.flash('error', 'Category name and description are required');
            return res.redirect('/admin/categories');
        }

        const categoryToUpdate = await Category.findById(categoryId);
        if (!categoryToUpdate) {
            req.flash('error', 'Category not found');
            return res.redirect('/admin/categories');
        }

        categoryToUpdate.category = category;
        categoryToUpdate.description = description;
        await categoryToUpdate.save();

        req.flash('success', 'Category updated successfully');
        res.redirect('/admin/categories');
    } catch (err) {
        console.log("Error while trying to edit the category", err);
        req.flash('error', 'Failed to update category');
        res.redirect('/admin/categories');
    }
};




export const showAndHideCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);

        if (!category) {
            req.flash('error', 'Category not found');
            return res.redirect('/admin/categories');
        }

        category.isListed = !category.isListed;
        await category.save();

        req.flash('success', category.isListed ? 'Category is now visible' : 'Category is now hidden');
        res.redirect('/admin/categories');
    } catch (err) {
        console.log("Error while trying to hide or show the category", err);
        req.flash('error', 'Failed to update category visibility');
        res.redirect('/admin/categories');
    }
};