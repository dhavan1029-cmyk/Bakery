export function home(req, res){
    res.render('homepage')
}

export function about(req, res){
    res.render('about')
}

export function contact(req, res){
    res.render('contact')
}

export function menu(req, res){
    res.render('menu', {products: []})
}

export function login(req, res){
    res.render('login', {error: null})
}

export function signup(req, res){
    res.render('signup', {error: null})
}

export function cart(req, res) {
    res.render('cart', {error: null, cartItems: []});
}

export function checkout(req, res) {
    res.render('checkout', {error: null, cartItems: [], subtotal: 0, deliveryFee: 0, total: 0});
}

export function orders(req, res) {
    res.render('orders', {orders: []});
}
