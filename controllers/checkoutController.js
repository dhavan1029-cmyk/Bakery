
import userModel from "../models/userModel.js";
import ordersModel from "../models/ordersModel.js";
import productModel from "../models/productModel.js";
import { getIO } from "../socket.js";
import mongoose from "mongoose";

// HELPERS

function isMaxOrderLimitExceeded(items) {
    return items.some(item => item.quantity > item.product.maxQuantityPerOrder);
}

function calculateTotal(items, deliveryFee) {
    const subtotal = items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );

    return { subtotal, total: subtotal + deliveryFee };
}

function validateFields(fields) {
    return fields.every(field =>
        typeof field === "string" ? field.trim() : Boolean(field)
    );
}

async function checkAvailability(...items) {
    for (const item of items) {
        const id = item.product?._id || item.product;
        const product = await productModel.findById(id);

        if (!product || !product.availability) return false;
    }

    return true;
}

function isValidQuantity(quantity) {
    return Number.isInteger(quantity) && quantity > 0;
}

function parseCheckoutPrices(value) {
    try {
        const parsed = typeof value === "string"
            ? JSON.parse(value)
            : value;

        if (!Array.isArray(parsed)) return new Map();

        return new Map(
            parsed.filter(item =>
                Array.isArray(item) &&
                item.length === 2 &&
                mongoose.isValidObjectId(item[0]) &&
                Number.isFinite(Number(item[1]))
            ).map(([id, price]) => [id.toString(), Number(price)])
        );
    } catch {
        return new Map();
    }
}

function findPriceChanges(items, checkoutPrices) {
    return items.flatMap(item => {
        const id = item.product._id.toString();
        const currentPrice = item.product.price;
        const checkoutPrice = checkoutPrices.get(id);

        return checkoutPrice !== undefined && checkoutPrice !== currentPrice
            ? [[id, checkoutPrice, currentPrice]]
            : [];
    });
}

function badRequest(res, statusCode = 400) {
    return res.status(statusCode).render("badRequest", { statusCode });
}

// GET CHECKOUT

export async function getCheckoutPage(req, res) {
    try {
        const {
            maintenanceMode,
            storeOpen,
            acceptOrders,
            deliveryFee,
            deliveryTime,
            cod,
            onlinePayment
        } = req.settings;

        if (maintenanceMode || !storeOpen || !acceptOrders) {
            return res.render("storeStatus", {
                maintenanceMode,
                storeOpen,
                acceptOrders
            });
        }

        if (!req.user) {
            return res.redirect("/login?loginRequired=true");
        }

        let { productID, quantity, reorderId } = req.query;

        if (
            (productID && !mongoose.isValidObjectId(productID)) ||
            (reorderId && !mongoose.isValidObjectId(reorderId))
        ) {
            return badRequest(res);
        }

        if (productID) {
            quantity = Number(quantity);
            if (!isValidQuantity(quantity)) return badRequest(res);
        }

        const changedPrices = parseCheckoutPrices(req.query.changedPrices);
        let cartItems = [];

        // REORDER
        if (reorderId) {
            const order = await ordersModel.findOne({ _id: reorderId, userID: req.user._id }).populate('products.product')

            if (!order) return badRequest(res, 404);
            if (order.products.some(item => !item.product)) return badRequest(res);

            if (!(await checkAvailability(...order.products))) {
                return res.render("checkout", {
                    reorderId,
                    checkoutError: "One or more products are currently unavailable.",
                    orderError: "",
                    cartItems: order.products,
                    subtotal: 0,
                    total: 0,
                    deliveryFee,
                    productID: null,
                    quantity: null,
                    formData: {},
                    changedPrices: [],
                    deliveryTime,
                    cod,
                    onlinePayment
                });
            }

            cartItems = order.products.map(item => ({
                product: item.product,
                quantity: item.quantity
            }));
        }

        // CART CHECKOUT
        else if (!productID) {
            const user = req.user
            user.populate('cart.product')

            if (!user) return badRequest(res, 401);
            if (!user.cart.length) {
                return res.render("checkout", {
                    checkoutError: "Your cart is empty.",
                    orderError: "",
                    formData: null
                });
            }

            if (user.cart.some(item => !item.product)) {
                return badRequest(res);
            }

            if (
                !(await checkAvailability(...user.cart)) ||
                isMaxOrderLimitExceeded(user.cart)
            ) {
                return res.redirect("/cart");
            }

            cartItems = user.cart;
        }

        // DIRECT PRODUCT
        else {
            const product = await productModel.findById(productID);

            if (!product) {
                return res.render("checkout", {
                    checkoutError: "Product not found.",
                    orderError: "",
                    formData: null
                });
            }

            if (
                !product.availability ||
                quantity > product.maxQuantityPerOrder
            ) {
                return product.availability
                    ? res.redirect(`/product/${productID}?quantityExceeded=true`)
                    : res.redirect(`/product/${productID}?unavailable=true`);
            }

            cartItems = [{ product, quantity }];
        }

        const { subtotal, total } = calculateTotal(cartItems, deliveryFee);

        return res.render("checkout", {
            reorderId,
            checkoutError: "",
            orderError: "",
            cartItems,
            subtotal,
            total,
            deliveryFee,
            productID,
            quantity,
            formData: {},
            changedPrices: Array.from(changedPrices.entries()),
            deliveryTime,
            cod,
            onlinePayment
        });

    } catch (err) {
        console.error("getCheckoutPage:", err);
        return res.status(500).render("serverError");
    }
}


// PLACE ORDER

export async function placeOrder(req, res) {
    try {
        if (!req.user) {
            return res.redirect("/login?loginRequired=true");
        }

        const {
            maintenanceMode,
            storeOpen,
            acceptOrders,
            deliveryFee,
            cod,
            onlinePayment
        } = req.settings;

        if (maintenanceMode || !storeOpen || !acceptOrders) {
            return res.render("storeStatus", {
                maintenanceMode,
                storeOpen,
                acceptOrders
            });
        }

        const {
            fullName,
            phone,
            house,
            landmark,
            address,
            city,
            state,
            pincode,
            paymentMethod,
            notes,
            productID,
            quantity,
            reorderId,
            pricesAtCheckout
        } = req.body;

        // IDs
        if (
            (productID && !mongoose.isValidObjectId(productID)) ||
            (reorderId && !mongoose.isValidObjectId(reorderId))
        ) {
            return badRequest(res);
        }

        // Quantity
        const parsedQuantity = productID ? Number(quantity) : null;

        if (
            productID &&
            !isValidQuantity(parsedQuantity)
        ) {
            return badRequest(res);
        }

        // Payment
        if (!["cod", "online"].includes(paymentMethod)) return badRequest(res);

        if((paymentMethod === 'cod' && !cod) && (paymentMethod === 'online' && !onlinePayment)) return res.redirect('/checkout')

        // Address
        if (!validateFields([
            fullName,
            phone,
            house,
            landmark,
            address,
            city,
            state,
            pincode
        ])) {
            return res.redirect("/checkout");
        }

        if (!/^\d{10}$/.test(String(phone))) {
            return res.redirect("/checkout");
        }

        if (!/^\d{6}$/.test(String(pincode))) {
            return res.redirect("/checkout");
        }

        const user = req.user
        await user.populate('cart.product')

        if (!user) return badRequest(res, 401);

        const userID = user._id;
        const deliveryAddress = {
            fullName,
            phone,
            house,
            landmark,
            address,
            city,
            state,
            pincode
        };

        let products = [];
        let subtotal;
        let total;

        // REORDER
        if (reorderId) {
            const oldOrder = await ordersModel.findOne({ _id: reorderId, userID }).populate('products.product')

            if (!oldOrder) return badRequest(res, 404);
            if (!oldOrder.products.length) return res.redirect("/checkout");

            if (oldOrder.products.some(item => !item.product)) {
                return badRequest(res);
            }

            if (
                !(await checkAvailability(...oldOrder.products)) ||
                isMaxOrderLimitExceeded(oldOrder.products)
            ) {
                return res.redirect("/checkout");
            }

            const checkoutPrices = parseCheckoutPrices(pricesAtCheckout);
            const priceChanges = findPriceChanges(
                oldOrder.products,
                checkoutPrices
            );

            if (priceChanges.length) {
                return res.redirect(
                    `/checkout?reorderId=${reorderId}&priceChanges=${encodeURIComponent(
                        JSON.stringify(priceChanges)
                    )}`
                );
            }

            products = oldOrder.products.map(item => ({
                product: item.product._id,
                orderPrice: item.product.price,
                quantity: item.quantity
            }));

            const currentItems = oldOrder.products.map(item => ({
                product: item.product,
                quantity: item.quantity
            }));

            ({ subtotal, total } = calculateTotal(
                currentItems,
                deliveryFee
            ));
        }

        // CART
        else if (!productID) {
            if (!user.cart.length) return res.redirect("/checkout");

            if (
                user.cart.some(item => !item.product) ||
                !(await checkAvailability(...user.cart)) ||
                isMaxOrderLimitExceeded(user.cart)
            ) {
                return res.redirect("/cart");
            }

            products = user.cart.map(item => ({
                product: item.product._id,
                orderPrice: item.product.price,
                quantity: item.quantity
            }));

            ({ subtotal, total } = calculateTotal(
                user.cart,
                deliveryFee
            ));
        }

        // DIRECT PRODUCT
        else {
            const product = await productModel.findById(productID);

            if (!product) return res.redirect("/checkout");

            if (!product.availability) {
                return res.redirect(
                    `/product/${productID}?unavailable=true`
                );
            }

            if (parsedQuantity > product.maxQuantityPerOrder) {
                return res.redirect(
                    `/product/${productID}?quantity=${parsedQuantity}`
                );
            }

            products.push({
                product: product._id,
                orderPrice: product.price,
                quantity: parsedQuantity
            });

            subtotal = product.price * parsedQuantity;
            total = subtotal + deliveryFee;
        }

        if (!products.length) return res.redirect("/checkout");

        // Never trust payment status from the client.
        const paymentStatus = "Pending";

        const newOrder = await ordersModel.create({
            userID,
            products,
            subtotal,
            total,
            deliveryFee,
            orderNotes: notes,
            deliveryAddress,
            paymentMethod,
            paymentStatus
        });

        if (!productID && !reorderId) {
            user.cart = [];
        }

        userModel.updateOne({id: user._id}, {
            $push: {
                orders: newOrder._id
            }
        })

        getIO().emit("notify admin", {
            orderId: newOrder._id.toString(),
            message: `Order placed by ${user.username}`,
            status: newOrder.status,
            customerName: newOrder.deliveryAddress.fullName,
            phone: newOrder.deliveryAddress.phone,
            itemCount: newOrder.products.length,
            total: newOrder.total,
            paymentMethod: newOrder.paymentMethod,
            paymentStatus: newOrder.paymentStatus,
            createdAt: newOrder.createdAt
        });

        return res.redirect(`/order-success/${newOrder._id}`);

    } catch (err) {
        console.error("placeOrder:", err);
        return res.status(500).render("serverError");
    }
}




