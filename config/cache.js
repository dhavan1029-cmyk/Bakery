import productModel from "../models/productModel.js"
import settingsModel from "../models/settingsModel.js"

const cache = {}

export function getValue(key){
    return cache[key]
}

export function setValue(key, value){
    cache[key] = value
}

const settings = await settingsModel.findOne({})
const products = await productModel.find()

setValue('deliveryFee', settings.deliveryFee)
setValue('products', products)
