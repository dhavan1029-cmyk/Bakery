import productModel from "../../models/productModel.js";

export async function getProducts(req, res) {
    try {

        const products = await productModel
            .find()
            .sort({ createdAt: -1 });

        res.render('admin/products', {
            products
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