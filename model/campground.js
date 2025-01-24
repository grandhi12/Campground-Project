//import mongoose from 'mongoose';
const mongoose =require('mongoose');
const Review = require('./review');
const User =require('./user')
const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
});
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});
const camgroundSchema = new mongoose.Schema({
    title: String,
    price: Number,
    images: [ImageSchema],
    description: String,
    location: String,
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews :[{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Review'
    }]
});

module.exports = mongoose.model('Campground', camgroundSchema);


