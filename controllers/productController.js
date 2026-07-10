import productModel from "../models/productModel.js";

export async function getMenu(req, res){
    try{

        const products = await productModel.find();

        res.render('menu', { products });

    }catch(err){

        console.error(err);

        res.status(500).send('Server Error');

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
        products: resultProducts
    })

}

export async function renderProduct(req, res){
    
    try {
        
        const product = await productModel.findById(req.params.id)
        const relatedProducts = await productModel.find({
            category: product.category,
            _id: { $ne: product._id }
        });

        res.render('product', {product, relatedProducts})

    } catch (err) {

        console.log('something went wrong')

    }

}

