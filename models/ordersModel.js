import mongoose from "mongoose"

const orderSchema = mongoose.Schema({
    userID: mongoose.Schema.Types.ObjectId,
    products: [mongoose.Schema.Types.ObjectId],
    totalPrice: Number,
    orderingDate: Date
})

export default mongoose.model('order', orderSchema)