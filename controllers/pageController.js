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

export function unauthoziedAction(req, res){
    res.render('unauthorized')
}