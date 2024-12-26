import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
   
    
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const namePrefix = Date.now();
        const ext = path.extname(file.originalname)
        const newName = namePrefix + ext; 
        cb(null, newName);
    }
 });

 const upload = multer({ storage });

export default upload;
