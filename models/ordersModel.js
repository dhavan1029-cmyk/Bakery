import mongoose from "mongoose"

const orderSchema = mongoose.Schema({
    userID: mongoose.Schema.Types.ObjectId,
    products: [{
        product: mongoose.Schema.Types.ObjectId,
        quantity: Number
    }],
    totalPrice: Number,
    paymentMethod: String,
    status: {
        type: String,
        default: "Preparing"
    },
    orderingDate: Date
})

export default mongoose.model('Order', orderSchema)