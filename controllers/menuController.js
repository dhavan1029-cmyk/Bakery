import productModel from "../models/productModel.js";

export default async function menu(req, res){
    try{

        const products = await productModel.find();

        res.render('menu', { products });

    }catch(err){

        console.error(err);

        res.status(500).send('Server Error');

    }
}