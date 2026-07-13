import mongoose from 'mongoose'

const orderSchema = mongoose.Schema({

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    products: [{

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true
        }

    }],

    deliveryAddress: {

        fullName: String,
        phone: String,
        house: String,
        address: String,
        landmark: String,
        city: String,
        state: String,
        pincode: String

    },

    orderNotes: String,

    subtotal: Number,

    deliveryFee: {
        type: Number,
        default: 50
    },

    totalPrice: Number,

    paymentMethod: {
        type: String,
        enum: ["cod", "online"]
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },

    status: {
        type: String,
        enum: [
            "Preparing",
            "Baking",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ],
        default: "Preparing"
    }

},
{
    timestamps: true
})

export default mongoose.model('Order', orderSchema)