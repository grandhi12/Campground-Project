const { cloudinary } = require('../cloudinary')
const Campground=require('../model/campground')

module.exports.home=async(req,res)=>{
    const campgrounds =await Campground.find({})
    res.render('homepage',{campgrounds});
}

module.exports.elementpage= (req,res)=>{
    res.render('getele')
}
module.exports.elementadd=async(req,res)=>{
    const camp=new Campground(req.body)
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.author = req.user._id;
    await camp.save()
    console.log(camp)
    req.flash('success','new campground is made sucessfully')
    res.redirect(`/camp/${camp._id}`)
}
module.exports.newele=async(req,res)=>{
    const {id} =req.params;
    const campgrounds=await Campground.findById(id).populate('reviews').populate('author');
    if(!campgrounds){
        req.flash('error','can\'t find the campground')
        res.redirect('/camp')
    }
    res.render('element',{campgrounds})
}

module.exports.editele=async(req,res)=>{
    const {id} =req.params;
    const campgrounds=await Campground.findById(id);
    res.render('editfile',{campgrounds})
}

module.exports.updateele=async(req,res)=>{
    const {id} =req.params;
    const campgrounds=await Campground.findByIdAndUpdate(id,{...req.body});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campgrounds.images.push(...imgs);
    await campgrounds.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
       
        await campgrounds.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success','new postr added sucessfully')
    res.redirect(`/camp/${campgrounds._id}`)
}
module.exports.deleteele=async(req,res)=>{
    const {id}=req.params;
    const campgrounds=await Campground.findByIdAndDelete(id);
    req.flash('success','Post deleted succesfully')
    res.redirect('/camp')
}

