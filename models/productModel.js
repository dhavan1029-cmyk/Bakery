import mongoose from "mongoose"

const productSchema = mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    category: String,
    quantity: {
        type: Number,
        default: 1
    }
})

export default mongoose.model('product', productSchema)