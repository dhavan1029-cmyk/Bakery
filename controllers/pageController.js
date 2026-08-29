import settingsModel from "../models/settingsModel.js"

export function home(req, res){    
    const isLoggedOut = req.query.loggedOut
    res.render('homepage', { isLoggedOut })
}

export function about(req, res){
    res.render('about')
}

export async function contact(req, res){
    const contactInfo = await settingsModel.findOne({}).select('-_id storeEmail storePhone storeAddress')
    
    res.render('contact', { contactInfo })
}

export function unauthoziedAction(req, res){
    res.render('unauthorized')
}