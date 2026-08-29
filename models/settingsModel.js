import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    storeName: {
        type: String,
        required: true,
        trim: true,
        default: 'FLOURish Bakery'
    },

    storeEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    storePhone: {
        type: String,
        trim: true,
        default: ''
    },

    storeAddress: {
        type: String,
        trim: true,
        default: ''
    },


    // PAYMENT

    onlinePayment: {
        type: Boolean,
        default: true
    },

    cod: {
        type: Boolean,
        default: true
    },


    // ORDER SETTINGS

    deliveryFee: {
        type: Number,
        min: 0,
        default: 50
    },

    minOrderAmount: {
        type: Number,
        min: 0,
        default: 0
    },

    deliveryTime: {
        type: String,
        enum: [
            '30-45',
            '45-60',
            '60-90',
            '90-120'
        ],
        default: '30-45'
    },

    defaultMaxOrder: {
        type: Number,
        min: 1,
        default: 10
    },


    // STORE STATUS

     storeOpen: {
        type: Boolean,
        default: true
    },

    acceptOrders: {
        type: Boolean,
        default: true
    },

    maintenanceMode: {
        type: Boolean,
        default: false
    }
    },
    {
        timestamps: true
    }
);

const settingsModel = mongoose.model('Settings', settingsSchema);

export default settingsModel;