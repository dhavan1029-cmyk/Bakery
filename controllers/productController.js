import productModel from "../models/productModel.js";

export async function getMenu(req, res){
    try{

        const products = await productModel.find();

        res.render('menu', { products, err: '' });

    }catch(err){

        console.error(err);

        res.render('menu', {products: [], err})

    }
}

export async function searchProducts(req, res){

    const searchValue = req.query.q
    
    const resultProducts = await productModel.find({
        name: {
            $regex: searchValue,
            $options: 'i'
        }
    })


    res.json({
        success: true,
        products: resultProducts || []
    })

}

export async function renderProduct(req, res){
    
    try {
        
        const {unavailable} = req.query

        const product = await productModel.findById(req.params.id)
        product.availability = true
        await product.save()
        const relatedProducts = await productModel.find({
            category: product.category,
            _id: { $ne: product._id }
        });

        res.render('product', {product, relatedProducts, unavailable})

    } catch (err) {

        console.log(err)
        res.redirect('/serverError')

    }

}

