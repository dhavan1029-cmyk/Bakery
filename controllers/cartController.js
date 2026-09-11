import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";

// Calculate the cart subtotal and final total.

function calculateTotal(user, deliveryFee) {

    let subtotal;

    if (user.cart.length === 0) {

        subtotal = 0;

    } else if (user.cart.length === 1) {

        const cartItem = user.cart[0];
        subtotal = cartItem.product.price * cartItem.quantity;

    } else {

        const lineTotals = user.cart.map(cartItem =>
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

export async function getCartItems(req, res) {
    try {

        const deliveryFee = req.settings.deliveryFee
        const changedPrices = req.query.changedPrices || '[]'
        const prices = JSON.parse(changedPrices)
        const products = await productModel.find({})

        if(!req.user){
            return res.redirect('/login?loginRequired=true')
        }

        const user = await userModel.findOne({email: req.user.email})
        await user.populate('cart.product')
        const cartItems = user.cart

        const {subtotal, total} = calculateTotal(user, deliveryFee)
        
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

    const user = await userModel.findOne({
        email: req.user.email
    });

    for (let index = 0; index < user.cart.length; index++) {

        const cartItem = user.cart[index];

        if (cartItem.product._id.toString() === itemId) {

            user.cart.splice(index, 1);

            await user.save();
            await user.populate("cart.product");

            const { subtotal, total } = calculateTotal(user, req.settings.deliveryFee);

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

        const product = await productModel.findById(productId)

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

        const user = await userModel.findOne({
            email: req.user.email
        });




        for (const cartItem of user.cart) {
            if (cartItem.product.toString() === productId) {
                
                const newQuantity = cartItem.quantity + (+quantity)

                if(newQuantity > product.maxQuantityPerOrder) {
                    return res.json({ 
                        success: false,
                        reason: "preorder_required",
                        message: "Ordering in large quantity requires preorder"
                    })
                } else {
                    cartItem.quantity = newQuantity;
                }


                await user.save();

                return res.json({
                    success: true,
                    message: 'Product added to cart'
                });

            }

        }




        user.cart.push({
            product: productId,
            quantity
        });

        await user.save();

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

        const deliveryFee = req.settings.deliveryFee

        const { productId, updateQty } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false
            });
        }

        const product = await productModel.findById(productId)

        if(!product){
            return res.json({
                success: false,
                message: 'product not found'
            })
        }

        const user = await userModel.findOne({email: req.user.email});

        const quantityChange = updateQty / Math.abs(updateQty);

        if (updateQty !== 1 && updateQty !== -1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity'
            });
        }

        for (let index = 0; index < user.cart.length; index++) {

            const cartItem = user.cart[index];

            if (cartItem.product.toString() !== productId) {
                continue;
            }

            // Remove the product if its quantity reaches zero.
            if (quantityChange < 0 && cartItem.quantity <= 1) {

                user.cart.splice(index, 1);

                await user.save();
                await user.populate("cart.product");
                console.log(req.settings.deliveryFee)
                const { subtotal, total } = calculateTotal(user, deliveryFee);


                
                return res.json({
                    success: true,
                    qty: 0,
                    subtotal,
                    total
                });

            }


            await user.populate("cart.product");

            const updatedCartItem = user.cart.find(cartItem =>
                cartItem.product._id.toString() === productId
            );


            if(cartItem.quantity + quantityChange > updatedCartItem.product.maxQuantityPerOrder && quantityChange > 0) {

                const { subtotal, total } = calculateTotal(user, deliveryFee);

                return res.json({
                    success: true,
                    qty: updatedCartItem.quantity,
                    subtotal,
                    total,
                    lineTotal: updatedCartItem.product.price * updatedCartItem.quantity
                })

            }  
            
            
            cartItem.quantity += quantityChange;

            await user.save();

            const { subtotal, total } = calculateTotal(user, deliveryFee);

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