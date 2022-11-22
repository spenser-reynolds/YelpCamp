const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const { join } = require('path');


const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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




app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
// when using params such as id in express route use express.Router({ mergeParams: true }) to pass params into the router params.


app.get('/', (req, res) => {
    res.render('home');
});


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