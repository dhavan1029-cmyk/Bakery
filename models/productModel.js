import mongoose from "mongoose"

const productSchema = mongoose.Schema({
    productName: String,
    productImageURL: URL,
    price: Number,
    discountPrice: Number
})

export default mongoose.model('product', productSchema)