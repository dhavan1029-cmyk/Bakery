import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";
import { getValue, setValue } from "../config/cache.js";
// Calculate the cart subtotal and final total.

function calculateTotal(cartItems, deliveryFee) {
    let subtotal;

    if (cartItems.length === 0) {

        subtotal = 0;

    } else if (cartItems.length === 1) {

        const cartItem = cartItems[0];
        subtotal = cartItem.product.price * cartItem.quantity;

    } else {

        const lineTotals = cartItems.map(cartItem =>
            cartItem.product.price * cartItem.quantity
        );

        subtotal = lineTotals.reduce(
            (previousTotal, currentTotal) => previousTotal + currentTotal
        );

    }

    return {
        subtotal,
        total: subtotal + deliveryFee
    };

}

async function getCartItems(cartItems){
    return await Promise.all(
        cartItems.map(async item => {
            const product = getValue(item.product)?.product || await productModel.findById(item.product)

            if(!getValue(item.product)) setValue(item.product, {product})

            return {product, quantity: item.quantity}
        })
    )
}

export async function renderCartItems(req, res) {
    try {

        const deliveryFee = getValue('deliveryFee')
        const changedPrices = req.query.changedPrices || '[]'
        const prices = JSON.parse(changedPrices)

        if(!req.user){
            return res.redirect('/login?loginRequired=true')
        }

        const user = req.user

        let cartItems = await getCartItems(user.cart)
        const {subtotal, total} = calculateTotal(cartItems, deliveryFee)
        
        res.render('cart', {cartItems, subtotal, total, deliveryFee, err: false, prices})
        
    } catch (err) {
        res.render('cart', {cartItems: [], err})
        console.log(err)
    }  
}



// Remove a product from the user's cart.
export async function deleteItem(req, res) {
    if(!req.user){
        return res.redirect('/login?loginRequired=true')
    }


    const { itemId } = req.body;

    if (!mongoose.isValidObjectId(itemId)) {
        return res.status(400).json({
            success: false,
            message: 'product not found'
        });
    }

    const user = req.user

    for (let index = 0; index < user.cart.length; index++) {

        const cartItem = user.cart[index];

        if (cartItem.product._id.toString() === itemId) {

            user.cart.splice(index, 1);

            await userModel.updateOne({email: req.user.email}, {
                $pull: {
                    cart: {product: itemId}
                }
            })

            const { subtotal, total } = calculateTotal(await getCartItems(user.cart), getValue('deliveryFee'));

            return res.json({
                success: true,
                subtotal,
                total
            });

        }

    }

    return res.json({
        success: false,
        message: 'Product not found'
    })

}



// Add a product to the cart or increase its quantity if it already exists.
export async function addToCart(req, res) {
    try{

        if(!req.user){
            return res.json({
                success: false,
                reason: 'login_required'
            })
        }




        const { productId, quantity } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false
            });
        }


        if(!Number.isInteger(+quantity) || +quantity < -1 ) {
            return res.json({
                success: false,
                message: 'Invalid Quantity'
            })
        }

        const product = getValue(productId)?.product || await productModel.findById(productId)

        if(!getValue(productId)) setValue(productId, {product})

        if(quantity > product.maxQuantityPerOrder) {
            return res.json({ 
                success: false,
                reason: "preorder_required",
                message: "Ordering in large quantity requires preorder"
            })
        }

        if(!product){            
            return res.json({
                success: false,
                reason: 'product_not_found',
                message: 'Our bakery doesn\'t sell this product'
            })
        }

        if(!product.availability){
            return res.json({
                success: false,
                reason: 'product_unavailable',
                message: 'Product is currently unavailable'
            })
        }

        const user = req.user




        for (const cartItem of user.cart) {
            if (cartItem.product.toString() === productId) {
                
                const newQuantity = cartItem.quantity + (+quantity)

                if(newQuantity > product.maxQuantityPerOrder) {
                    return res.json({ 
                        success: false,
                        reason: "preorder_required",
                        message: "Ordering in large quantity requires preorder"
                    })
                }


                await userModel.updateOne({email: req.user.email, 'cart.product': productId}, {
                    $inc: {
                        'cart.$.quantity': quantity
                    }
                });

                return res.json({
                    success: true,
                    message: 'Product added to cart'
                });

            }

        }

        const upd = await userModel.updateOne({email: req.user.email}, {
            $push: {
                cart: {product: productId, quantity}
            }
        })

        res.json({
            success: true,
            message: 'Product added to cart'
        });


    } catch (err) {
        (err)
        res.redirect('/serverError')
    }
}



// Increase or decrease the quantity of a cart item.
export async function changeQty(req, res) {

    try{

        if(!req.user) return res.redirect('/login?loginRequired=true')

        const deliveryFee = getValue('deliveryFee')

        const { productId, updateQty } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false
            });
        }
        const user = req.user

        user.cart = await getCartItems(user.cart)
        

        const quantityChange = updateQty / Math.abs(updateQty);

        if (updateQty !== 1 && updateQty !== -1) {
            
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity'
            });
        }

        for (let index = 0; index < user.cart.length; index++) {

            const cartItem = user.cart[index];

            if (cartItem.product._id.toString() !== productId) {
                continue;
            }

            // Remove the product if its quantity reaches zero.
            if (quantityChange < 0 && cartItem.quantity <= 1) {

                user.cart.splice(index, 1)

                await userModel.updateOne({
                    email: req.user.email
                }, {
                    $pull: {
                        cart: {product: productId}
                    }
                });


                const { subtotal, total } = calculateTotal(user.cart, deliveryFee);


                
                return res.json({
                    success: true,
                    qty: 0,
                    subtotal,
                    total
                });

            }



            const updatedCartItem = user.cart.find(cartItem =>
                cartItem.product._id.toString() === productId
            );


            if(cartItem.quantity + quantityChange > updatedCartItem.product.maxQuantityPerOrder && quantityChange > 0) {

                const { subtotal, total } = calculateTotal(user.cart, deliveryFee);

                return res.json({
                    success: true,
                    qty: updatedCartItem.quantity,
                    subtotal,
                    total,
                    lineTotal: updatedCartItem.product.price * updatedCartItem.quantity
                })

            }  

            updatedCartItem.quantity += updateQty

            await userModel.updateOne({
                email: req.user.email, 'cart.product': productId
            }, { 
                $inc: {'cart.$.quantity': updateQty} 
            })

            const { subtotal, total } = calculateTotal(user.cart, deliveryFee);

            const lineTotal = updatedCartItem.product.price * updatedCartItem.quantity;

            return res.json({
                success: true,
                qty: updatedCartItem.quantity,
                subtotal,
                total,
                lineTotal
            });

        }

        return res.json({
            success: false,
            message: 'product not found'
        })

    } catch (err) {
        (err)
        res.redirect('/serverError')
    }
}