import productModel from "../../models/productModel.js";
import cloudinary from "../../config/cloudinary.js";
import { isValidObjectId } from "mongoose";


function validateProduct({ name, description, availability, maxQuantityPerOrder, category, price, quantity}) {
    return (
        typeof name === 'string' &&
        name.trim() &&

        typeof description === 'string' &&
        description.trim() &&

        typeof availability === 'boolean' &&

        Number.isInteger(Number(maxQuantityPerOrder)) &&
        Number(maxQuantityPerOrder) > 0 &&

        typeof category === 'string' &&
        category.trim() &&

        Number.isFinite(Number(price)) &&
        Number(price) > 0 &&

        Number.isInteger(Number(quantity)) &&
        Number(quantity) > 0
    );
}

export async function getProducts(req, res) {

    try {

        const { message } = req.query;

        const products = await productModel
            .find()
            .sort({ createdAt: -1 });

        res.render('admin/products', {
            products,
            message
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
    });

}


export async function renderEditProduct(req, res) {

    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) return res.redirect('/admin/products?message=Product not found');

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

        res.status(500).render('admin/products/edit', {
            product: null,
            error: 'Unable to load the product.',
            formData: null
        });

    }

}


export async function createNewProduct(req, res) {

    let uploadedImage = null;

    try {

        const { name, description, maxQuantityPerOrder, category, price, quantity} = req.body;

        const availability = req.body.availability === 'true';

        if (!validateProduct({ name, description, availability, maxQuantityPerOrder, category, price, quantity })) {
            return res.render('admin/products/new', {
                error: 'Invalid data',
                formData: req.body
            });
        }

        if (!req.file) {
            return res.render('admin/products/new', {
                error: 'Product Image required',
                formData: req.body
            });
        }

        uploadedImage = await cloudinary.uploader.upload(req.file.path, {
            folder: "flourish/products"
        });

        await productModel.insertOne({

            name: name.trim(),
            description: description.trim(),
            availability,
            maxQuantityPerOrder: Number(maxQuantityPerOrder),
            category: category.trim(),
            price: Number(price),
            quantity: Number(quantity),

            image: uploadedImage.secure_url,
            imagePublicId: uploadedImage.public_id

        });

        res.redirect(
            '/admin/products?message=The changes are done'
        );

    } catch (err) {

        /*
         * MongoDB failed after Cloudinary succeeded.
         * Remove the newly uploaded Cloudinary image.
         */

        if (uploadedImage?.public_id) {

            await cloudinary.uploader.destroy(uploadedImage.public_id).catch(console.error);

        }

        console.error(err);
        res.redirect('/serverError');

    }

}


export async function editProduct(req, res) {

    let uploadedImage = null;

    try {

        const productId = req.params.id;

        if (!isValidObjectId(productId)) return res.redirect('/admin/products?message=Product not found');

        const { name, description, maxQuantityPerOrder, category, price, quantity } = req.body;

        const availability = req.body.availability === 'true';

        if (!validateProduct({ name, description, availability, maxQuantityPerOrder, category, price, quantity })) {
            return res.render('admin/products/edit', {
                error: 'Invalid data',
                formData: req.body
            });
        }

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).render(
                'admin/products/edit',
                {
                    product: {},
                    error: 'Product not found.',
                    formData: {}
                }
            );
        }

        /*
         * Keep the old image safe until MongoDB successfully saves.
         */

        const oldImagePublicId = product.imagePublicId;

        product.name = name.trim();
        product.description = description.trim();
        product.availability = availability;
        product.maxQuantityPerOrder = Number(maxQuantityPerOrder);
        product.category = category.trim();
        product.price = Number(price);
        product.quantity = Number(quantity);


        /*
         * Only upload if a new image was selected.
         */

        if (req.file) {

            uploadedImage = await cloudinary.uploader.upload(req.file.path);

            product.image = uploadedImage.secure_url;

            product.imagePublicId = uploadedImage.public_id;

        }


        await product.save();


        /*
         * MongoDB succeeded.
         * Now the old image can safely be deleted.
         */

        if ( uploadedImage && oldImagePublicId ) await cloudinary.uploader.destroy(oldImagePublicId).catch(console.error);

        res.redirect('/admin/products?message=The changes are done');

    } catch (err) {

        /*
         * MongoDB failed.
         * Delete the NEW image, not the old one.
         */

        if (uploadedImage?.public_id) await cloudinary.uploader.destroy(uploadedImage.public_id).catch(console.error);

        console.error(err);
        res.redirect('/serverError');

    }

}


export async function deleteProduct(req, res) {

    try {

        const productId = req.params.id;

        if (!isValidObjectId(productId)) return res.redirect('/admin/products');

        const product = await productModel.findById(productId);

        if (!product) return res.redirect('/admin/products?message=Product not found');

        /*
         * Delete from MongoDB first.
         */

        await productModel.findByIdAndDelete(productId);


        /*
         * Then delete the Cloudinary image.
         */

        if (product.imagePublicId) await cloudinary.uploader.destroy(product.imagePublicId).catch(console.error);

        res.redirect('/admin/products?message=The product has been deleted');

    } catch (err) {

        console.error(err);
        res.redirect('/serverError');

    }

}