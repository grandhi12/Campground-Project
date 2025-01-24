const Review=require('../model/review')
const Campground=require('../model/campground')
const User=require('../model/user')

module.exports.postReview=async(req,res)=>{
    const {id}=req.params;
    const campgrounds=await Campground.findById(id);
    const review = new Review(req.body)
    campgrounds.reviews.push(review)
    await review.save()
    await campgrounds.save()
    req.flash('success','review added sucessfully')
    res.redirect(`/camp/${id}`)  
}

module.exports.deleteReview=async(req,res)=>{
    const {campId,reviewId} = req.params;
    await Campground.findByIdAndUpdate(campId,{$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'review deleted sucessfully')
    res.redirect(`/camp/${campId}`)
}

module.exports.register=(req,res)=>{
    res.render('users/register')
}

module.exports.registerPost=async(req,res)=>{
    try{
        const {email, username ,password} =req.body;
        const user= new User({email, username});
        const registeredUser=await User.register(user,password);
        req.login(registeredUser,err=>{
            if(err) return next(err);
        console.log(registeredUser)
        req.flash('suscess','Register sucessfull')
        res.redirect('/camp');
    })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('register')
    }
}

module.exports.postlogin=async(req,res)=>{
    req.flash('suscess','login sucessfull')
    res.redirect('/camp');

}
module.exports.logoutc=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/camp');
    });
}

module.exports.login=(req,res)=>{
    res.render('users/login')
}