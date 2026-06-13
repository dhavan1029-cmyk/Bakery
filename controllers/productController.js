import productModel from "../models/productModel.js";

export default async function product(req, res){
    
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