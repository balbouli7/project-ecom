const bookController=require('../controllers/book.controler')
const router=require('express').Router()
const multer=require('multer')


// Route pour la recherche de livres par titre
router.get('/search',  bookController.searchBooksController);

router.get('/',bookController.getAllBooksController)
router.get('/:id',bookController.getOneBookDetailsController)

router.get('/addbook',bookController.getAddBooksController)

router.post('/addbook', multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'assets/images'); 
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + '-' + file.originalname);  
            }
        })
    }).fields([{ name: 'livre' }, { name: 'cover' }]),
     bookController.PostAddBooksController);


module.exports=router