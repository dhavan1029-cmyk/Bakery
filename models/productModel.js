import mongoose from "mongoose"

const productSchema = mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    category: String
})

export default mongoose.model('product', productSchema)