import productModel from "../../models/productModel.js"

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
                product: null,
                error: 'Product not found.',
                formData: null
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

        const {name, description, availability, maxQuantityPerOrder, category, price, quantity} = req.body

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

    const product = await productModel.findById(req.params.id)

    const productProps = ['name', 'availability', 'price', 'description', 'category','availability', 'maxQuantityPerOrder']

    productProps.forEach(async prop => {
        if(product[prop] !== req.body[prop]) {
            product[prop] = req.body[prop]
        }
    })

    if(req.file){
        product.image = req.file.path
    }

    await product.save()

    res.redirect('/admin/products?message=The changes are done')
}