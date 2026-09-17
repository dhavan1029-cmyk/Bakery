import isBoolean from "validator/lib/isBoolean.js";
import productModel from "../models/productModel.js";
import { getValue, setValue } from "../config/cache.js";

export async function getMenu(req, res){
    try{
        const {available, priceRange, sort} = req.query
        const availability = available === 'true' ? true :  available === 'false' ? false : 'all'

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


        const products = (getValue('products')
        .filter(product =>
            product.price >= filterParams.price.$gte &&
            product.price <= filterParams.price.$lte &&
            (availability !== 'all'
                ? product.availability === availability
                : true)
        )
        .sort((a, b) => {

            if (sortParams.price === 1) {
                return a.price - b.price;
            }

            if (sortParams.price === -1) {
                return b.price - a.price;
            }

            if (sortParams.name === 1) {
                return a.name.localeCompare(b.name);
            }

            if (sortParams.name === -1) {
                return b.name.localeCompare(a.name);
            }

            if (sortParams.createdAt === -1) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }

            return 0;
        })) || await productModel.find({
            price: {
                $gte: +price[0] || 0,
                $lte: +price[1] || Infinity
            },
            ...(availability !== 'all' && {
                availability
            })
        },
        null,
        {
            sort: sortParams
        });

        if(!getValue('products')) setValue('products', await productModel.find())

        res.render('menu', { products, err: '' , available, price, userId: req.user?._id || ''});

    }catch(err){

        console.error(err);

        res.render('menu', {products: [], err})

    }
}

export async function searchProducts(req, res){

    const searchValue = req.query.q
    
    const resultProducts = getValue(`search: ${req.query.q}`) || await productModel.find({
        $or: [
            {
                name: {
                    $regex: searchValue,
                    $options: 'i'
                }
            },
            {
                category: {
                    $regex: searchValue,
                    $options: 'i'
                }
            }
        ]
    });

    if(!getValue(`search: ${req.query.q}`)) setValue(`search: ${req.query.q}`, resultProducts)


    res.json({
        success: true,
        products: resultProducts || []
    })

}

export async function renderProduct(req, res){
    
    try {
        
        const {unavailable, quantity, quantityExceeded} = req.query

        const product = getValue(req.params.id)?.product || await productModel.findById(req.params.id)
        const relatedProducts =  getValue(req.params.id)?.relatedProducts || await productModel.find({
            category: product?.category || '',
            _id: { $ne: product?._id }
        });

        if(!getValue(req.params.id) || !getValue(req.params.id)?.relatedProducts) setValue(req.params.id, {product, relatedProducts})

        res.render('product', {product, relatedProducts, unavailable, quantity, quantityExceeded})

    } catch (err) {

        console.log(err)
        res.redirect('/serverError')

    }

}
