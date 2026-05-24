import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    orders: [mongoose.Schema.Types.ObjectId],
    cart: [{
        productID: mongoose.Schema.Types.ObjectId, 
        quantity: Number, 
    }]
})

export default mongoose.model('user', userSchema)