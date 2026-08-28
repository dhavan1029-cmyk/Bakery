import productModel from "../../models/productModel.js"
import cloudinary from "../../config/cloudinary.js";

function validateProduct({
    name,
    description,
    availability = 'false',
    maxQuantityPerOrder,
    category,
    price,
    quantity
}) {
    if (
        typeof name !== 'string' ||
        !name.trim() ||

        typeof description !== 'string' ||
        !description.trim() ||

        (availability !== 'true' && availability !== 'false') ||

        !Number.isInteger(Number(maxQuantityPerOrder)) ||
        Number(maxQuantityPerOrder) <= 0 ||

        typeof category !== 'string' ||
        !category.trim() ||

        !Number.isFinite(Number(price)) ||
        Number(price) <= 0 ||

        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0
    ) {
        return false;
    }

    return true;
}


export async function getProducts(req, res) {
    try {

        const { message } = req.query
        const products = await productModel
            .find()
            .sort({ createdAt: -1 });

        res.render('admin/products', {
            products, message
        });

    } catch (err) {

        console.error(err);

        res.redirect('/serverError');

    }
}

export function renderAddProduct(req, res) {

    res.render('admin/products/new', {
        error: '',
        formData: {}
    })

}

export async function renderEditProduct(req, res) {

    try {

        const { id } = req.params;

        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).render('admin/products/edit', {
                product: {},
                error: 'Product not found.',
                formData: {}
            });
        }

        res.render('admin/products/edit', {
            product,
            error: '',
            formData: null
        });

    } catch (err) {

        console.error(err);

        return res.status(500).render('admin/products/edit', {
            product: null,
            error: 'Unable to load the product.',
            formData: null
        });

    }
}

export async function createNewProduct(req, res){

    try{

        const { name, description, maxQuantityPerOrder, category, price, quantity } = req.body;
        const availability = req.body.availability === 'true';

        const error = validateProduct(name, description, availability, maxQuantityPerOrder, category, price, quantity);

        if (!error) {
            return res.render('admin/products/new', { error: 'Invalid data' , formData: req.body});
        }

        await productModel.insertOne({
            name, description, availability, maxQuantityPerOrder, category, price, quantity,
            image: req.file.path
        })

        res.redirect('/admin/products?message=The changes are done')
    } catch (err){
        console.log(err)
        res.redirect('/serverError')
    }

}   

export async function editProduct(req, res){
    const image = req.file

    if(!validateProduct(req.body)) return res.render('admin/products/edit', { error: 'Invalid data' , formData: req.body});

    const product = await productModel.findById(req.params.id)

    const productProps = ['name', 'availability', 'price', 'description', 'category','availability', 'maxQuantityPerOrder']

    productProps.forEach(async prop => {
        if(product[prop] !== req.body[prop]) {
            product[prop] = req.body[prop]
        }
    })

    product.availability = availability ? true : false

    if(req.file){
        product.image = req.file.path
    }

    await product.save()

    res.redirect('/admin/products?message=The changes are done')
}

export async function deleteProduct(req, res){

    const product = await productModel.findById(req.params.id)

    if(!product) return res.redirect('/admin/products?message=Product not found')

    await productModel.findByIdAndDelete(req.params.id)

    await cloudinary.uploader.destroy(product.image)

    res.redirect('/admin/products?message=The product has been deleted')
}
