import userModel from "../models/userModel.js";

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



// =====================
// Account
// =====================

export function getAccount(req, res) {

    res.render("account");

}



// =====================
// Cart
// =====================

export async function getCartItems(req, res) {

    if (!req.user) {
        return res.render("cart", {
            cartItems: []
        });
    }

    const user = await userModel
        .findById(req.user._id)
        .populate("cart.product");

    if (user.cart.length === 0) {
        return res.render("cart", {
            cartItems: []
        });
    }

    // Merge the product document with its quantity.
    const cartItems = user.cart.map(cartItem => ({
        ...cartItem.product.toObject(),
        quantity: cartItem.quantity
    }));

    const subtotal = cartItems
        .map(cartItem => cartItem.price * cartItem.quantity)
        .reduce(
            (previousTotal, currentTotal) =>
                previousTotal + currentTotal
        );

    const total = subtotal + DELIVERY_FEE;

    res.render("cart", {
        cartItems,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total
    });

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

    const { productId, quantity } = req.body;

    const user = await userModel.findOne({
        email: req.user.email
    });

    for (const cartItem of user.cart) {

        if (cartItem.product.toString() === productId) {

            cartItem.quantity += quantity;

            await user.save();

            return res.json({
                success: true
            });

        }

    }

    user.cart.push({
        product: productId,
        quantity
    });

    await user.save();

    res.json({
        success: true
    });

}



// Increase or decrease the quantity of a cart item.
export async function changeQty(req, res) {

    const { productId, updateQty } = req.body;

    const user = await userModel.findOne({
        email: req.user.email
    });

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

        cartItem.quantity += quantityChange;

        await user.save();
        await user.populate("cart.product");

        const updatedCartItem = user.cart.find(cartItem =>
            cartItem.product._id.toString() === productId
        );

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

}



// =====================
// Orders
// =====================

export async function getOrders(req, res) {

    const user = await userModel.findOne({
        email: req.user.email
    }).populate({
        path: "orders",
        populate: {
            path: "products.product"
        }
    });

    res.render("orders", {
        orders: user.orders
    });

}