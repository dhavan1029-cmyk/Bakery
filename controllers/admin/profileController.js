
import userModel from "../../models/userModel.js"
import bcrypt from "bcrypt"

export async function renderAdminAccount(req,res){
    try{
        const admin=req.admin
        res.render('admin/account',{admin})
    }catch(err){
        console.log(err)
        res.redirect('/serverError')
    }
}

export async function renderChangePassword(req,res){
    res.render('admin/changePassword',{
        admin:req.admin,error:'',success:'',formData:{}
    })
}

export async function logoutAdmin(req,res){
    res.clearCookie('admin')
    res.redirect('/admin/login')
}

export async function changePassword(req,res){
    try{
        const {currentPassword,newPassword,confirmPassword}=req.body
        const admin=await userModel.findOne({email:req.admin.email})

        
        if(!currentPassword||!newPassword||!confirmPassword)
            return res.render('admin/changePassword',{
                admin,error:'Fill all the fields',success:'',formData:req.body
            })

        if(newPassword.length<8)
            return res.render('admin/changePassword',{
                admin,error:'New password must be at least 8 characters',success:'',formData:req.body
            })

        if(currentPassword===newPassword)
            return res.render('admin/changePassword',{
                admin,error:'Current password cannot be the new password',success:'',formData:req.body
            })

        if(!await bcrypt.compare(currentPassword,admin.password))
            return res.render('admin/changePassword',{
                admin,error:'Incorrect password',success:'',formData:req.body
            })

        if(newPassword!==confirmPassword)
            return res.render('admin/changePassword',{
                admin,error:"Passwords don't match",success:'',formData:req.body
            })

        admin.password=await bcrypt.hash(newPassword,10)
        await admin.save()

        res.redirect('/admin/login?message=Password changed successfully. Please login again')
    }catch(err){
        console.log(err)
        res.redirect('/serverError')
    }
}
