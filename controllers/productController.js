import isBoolean from "validator/lib/isBoolean.js";
import productModel from "../models/productModel.js";

export async function getMenu(req, res){
    try{

        const {available, priceRange, sort} = req.query
        const availability = available === 'true' ? true :  available === 'false' ? false : 'all'
        console.log(availability)
        const price = priceRange?.split(',') || [0, Infinity]
        
        if (    
            typeof Number(price?.[0]) !== 'number' ||
            typeof Number(price?.[1]) !== 'number' ||
            !isBoolean(available || 'true') ||
            (sort && !['price-low', 'price-high', 'A-Z', 'Z-A', 'new'].includes(sort))
        ) {
            return res.redirect('/menu?available=true&priceRange=0%2CInfinity&sort=new');
        }
        let sortParams = {};

        if (sort === 'price-low') {
            sortParams.price = 1;
        }

        if (sort === 'price-high') {
            sortParams.price = -1;
        }

        if(sort === 'A-Z'){
            sortParams.name = 1
        }

        if(sort === 'Z-A'){
            sortParams.name = -1
        }

        if(sort === 'new'){
            sortParams.createdAt = -1
        }

        const filterParams = {
            price: {
                $gte: +price[0] || 0,
                $lte: +price[1] || Infinity
            }
        }

        if (availability !== 'all') {
            filterParams.availability = availability ;
        }


        const products = await productModel.find(filterParams).sort(sortParams)

        res.render('menu', { products, err: '' , available, price, userId: req.user?._id || ''});

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
        
        const {unavailable, quantity} = req.query

        const product = await productModel.findById(req.params.id)

        const relatedProducts = await productModel.find({
            category: product?.category || '',
            _id: { $ne: product?._id }
        });

        res.render('product', {product, relatedProducts, unavailable, quantity})

    } catch (err) {

        console.log(err)
        res.redirect('/serverError')

    }

}
