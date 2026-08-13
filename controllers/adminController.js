
export async function getLoginPage(req, res) {
    res.render('admin/login', {error: null, formData: {}})
}