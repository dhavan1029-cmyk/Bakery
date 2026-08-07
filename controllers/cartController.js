import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

const DELIVERY_FEE = 50;

// Calculate the cart subtotal and final total.

function calculateTotal(user) {

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
        total: subtotal + DELIVERY_FEE
    };

}

export async function getCartItems(req, res) {
    try {

        const products = await productModel.find({})

        if(!req.user){
            return res.redirect('/login?loginRequired=true')
        }

        const user = await userModel.findOne({email: req.user.email})
        await user.populate('cart.product')
        const cartItems = user.cart

        const {subtotal, total} = calculateTotal(user)

        res.render('cart', {cartItems, subtotal, total, deliveryFee: DELIVERY_FEE, err: false})
        
    } catch (err) {
        res.render('cart', {cartItems: [], err})

    }  
}



// Remove a product from the user's cart.
export async function deleteItem(req, res) {

    const { itemId } = req.body;

    const user = await userModel.findOne({
        email: req.user.email
    });

    for (let index = 0; index < user.cart.length; index++) {

        const cartItem = user.cart[index];

        if (cartItem.product._id.toString() === itemId) {

            user.cart.splice(index, 1);

            await user.save();
            await user.populate("cart.product");

            break;

        }

    }

    const { subtotal, total } = calculateTotal(user);

    res.json({
        success: true,
        subtotal,
        total
    });

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


        if(!Number.isInteger(quantity) || quantity < -1 ) {
            return res.json({
                success: false,
                message: 'Invalid Quantity'
            })
        }

        if(quantity >= 20) {
            return res.json({ 
                success: false,
                reason: "preorder_required",
                message: "Orders above 20 items require a preorder."
            })
        }


        const product = await productModel.findById(productId)

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

                if(newQuantity >= 20) {
                    return res.json({ 
                        success: false,
                        reason: "preorder_required",
                        message: "Orders above 20 items require a preorder."
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
        console.log(err)
        res.redirect('/serverError')
    }
}



// Increase or decrease the quantity of a cart item.
export async function changeQty(req, res) {

    try{
        const { productId, updateQty } = req.body;

        const user = await userModel.findOne({email: req.user.email});

        const quantityChange = updateQty / Math.abs(updateQty);


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

                const { subtotal, total } = calculateTotal(user);


                
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

                const { subtotal, total } = calculateTotal(user);

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

            const { subtotal, total } = calculateTotal(user);

            const lineTotal = updatedCartItem.product.price * updatedCartItem.quantity;

            return res.json({
                success: true,
                qty: updatedCartItem.quantity,
                subtotal,
                total,
                lineTotal
            });

        }


    } catch (err) {
        console.log(err)
        res.redirect('/serverError')
    }
}