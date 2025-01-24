module.exports.isLogged=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error','you must be logged in');
        res.redirect('/login')
    }
    next();
}