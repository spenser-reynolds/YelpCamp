const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const { campgroundSchema } = require('./schemas.js')
const { reviewSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const { join } = require('path');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { 
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    console.log(error);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

app.get('/campgrounds/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new')
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground })
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));
// REVIEWS ROUTES

app.post('/campgrounds/:id/reviews', validateReview,  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Testing Scipt
// app.get('/makecampground', async(req, res) => {
//     const camp = new Campground({title: 'My backyard', description: 'cheap camping'});
//     await camp.save();
//     res.send(camp);
// });


// Error Handling
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
}) 

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log("App is listening on port 3000");
});