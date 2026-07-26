export function home(req, res){    
    const isLoggedOut = req.query.loggedOut
    res.render('homepage', { isLoggedOut })
}

export function about(req, res){
    res.render('about')
}

export function contact(req, res){
    res.render('contact')
}

export function cart(req, res) {
    res.render('cart', {error: null, cartItems: []});
}

export function orders(req, res) {
    res.render('orders', {orders: []});
}
