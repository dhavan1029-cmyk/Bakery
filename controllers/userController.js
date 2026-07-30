


// =====================
// Account
// =====================

export function getAccount(req, res) {

    if(!req.user){
        res.redirect('/login?loginRequired=true')
    }

    res.render("account");

}


export async function logoutUser(req, res) {
    res.clearCookie('userToken')
    res.redirect('/?loggedOut=true')
}

