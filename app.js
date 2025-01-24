if (process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

// require('dotenv').config();
//import express from 'express';
//import mongoose from 'mongoose';
//import path from 'path';
//import Campground from './model/campground.js';

const passportLocalMongoose = require('passport-local-mongoose');
const express =require('express');
const { campgroundSchema, reviewSchema } = require('./schema.js');
const expressLayouts = require('express-ejs-layouts');
const ExpressError=require('./utils/ExpressError')
const catchasync =require('./utils/catchasync')
const flash =require('connect-flash')
const campControllers= require('./controllers/campgroundContollers.js')
reviewControllers =require('./controllers/reviewControllers')
const app =express();
const ejsMate= require('ejs-mate')
const {storage} = require('./cloudinary')
const multer =require('multer')
const upload= multer({storage})
const methodOverride= require('method-override')
const mongoose =require('mongoose');
const path=require('path')
const Campground= require('./model/campground.js');
const Review = require('./model/review.js');
const User= require('./model/user.js')
const passport =require('passport');
const localStrategy =require('passport-local');
const {isLogged}=require('./islogged')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const uri= process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'
const secret= process.env.SECRET || 'thisshouldbeabettersecret!'
const store = MongoStore.create({
    mongoUrl: uri,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

const sessionConfig ={
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        //secure:true,
        expires : Date.now() + 1000 *60 *60 *24*7,
        maxAge : 1000 *60 *60 *24*7
    }
}
app.set('view engine','ejs');
app.set(path.join(__dirname,'views')) 
app.engine('ejs',ejsMate)
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(session(sessionConfig))
app.use(flash());

app.use(expressLayouts);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const { error, dir } = require('console');
const { name } = require('ejs');
// Set the default layout file (optional, defaults to "layout.ejs")
app.set('layout', 'layouts/boilerplate');
// mongodb://127.0.0.1:27017/yelp-camp
mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//  .then(()=>{
//     console.log('connected')
//    })
//    .catch(err=>{ 
//     console.log('error')
//     console.log(err) 
//    })
  
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



  
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else { 
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = ReviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const idCheck=async(req,res,next)=>{
    const {id}=req.params;
    const campgrounds= await Campground.findById(id)
    if(!campgrounds.author.equals(req.user._id)){
        req.flash('error', 'you don\'t havepermission to do that' );
        return res.redirect(`/camp/${id}`)
    }
    next();
}

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser= req.user;
    next();
});

app.get('/',isLogged,(req,res)=>{
    res.render('home')
});

app.get('/camp',campControllers.home);
  

app.get('/camp/form',isLogged,campControllers.elementpage)
app.post('/camp',isLogged,upload.array('image'),validateCampground,catchasync(campControllers.elementadd))

app.get('/register',reviewControllers.register)
app.post('/regsiter',catchasync(reviewControllers.registerPost));
app.get('/login',reviewControllers.login)
app.post('/login',passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}),reviewControllers.postlogin);

app.get('/logout', reviewControllers.logoutc); 
app.get('/camp/:id',catchasync(campControllers.newele))
app.get('/camp/:id/edit',catchasync(campControllers.editele))
app.put('/camp/:id',upload.array('image'),validateCampground,idCheck,catchasync(campControllers.updateele))
app.delete('/camp/:id',idCheck,catchasync(campControllers.deleteele))
app.post('/camp/:id/review',catchasync(reviewControllers.postReview))
app.delete('/camp/:campId/review/:reviewId',reviewControllers.deleteReview)
app.all(/(.*)/,(req,res,next)=>{
    next(new ExpressError('Wrong path',404))
})
app.use((err,req,res,next)=>{
    const{statuscode=500}=err
    if(!err.message) err.message='Something is wrong'
    res.status(statuscode).render('./partials/error.ejs',{err})
})
app.listen(3000,()=>{
    console.log('listening')
})
     
