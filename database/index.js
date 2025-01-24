const mongoose = require('mongoose')
const cities = require('./cities.js')
const {descriptors,places} =require('./placesDecriptors.js')
const Campground= require('../model/campground.js')
//import mongoose from 'mongoose';
//import cities from './cities.js';
//import {descriptors,places} from './placesDecriptors.js';
//import Campground from '../model/campground.js';

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
 .then(()=>{
    console.log('connected')
   })
   .catch(err=>{
    console.log('error')
    console.log(err) 
   })
   const sample= array => array[Math.floor(Math.random()*array.length)];
   const seedDB=async()=>{
    await Campground.deleteMany({})
   for(let i=0;i<50;i++){
    const randomNum= Math.floor(Math.random()*1000)
    const randomPrice= Math.floor(Math.random()*30)
    const ramdomImage= Math.random()
    const camp=new Campground({
        author : '678f0436fd72b9da500f8600',
        location : `${cities[randomNum].city}, ${cities[randomNum].state}`,
        title : `${sample(descriptors)} ${sample(places)}`,
        images: [{
            url: 'https://res.cloudinary.com/dsljzr3so/image/upload/v1737619589/Yelp/c4vgdwaxg6ey2eqvifrh.jpg',
            filename: 'Yelp/c4vgdwaxg6ey2eqvifrh'
          },
          {
            url: 'https://res.cloudinary.com/dsljzr3so/image/upload/v1737619589/Yelp/uonoddq8pih6a980ab05.jpg',
            filename: 'Yelp/uonoddq8pih6a980ab05'
          }],
        description: "This is the description for this page. Adding more description",
        price: randomPrice
    })
    await camp.save();
   }
}
seedDB().then(() => {
    mongoose.connection.close();
})