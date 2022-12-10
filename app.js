const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const { join } = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const user = require('./models/user');
const { route } = require('./routes/campgrounds');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { 
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionconfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // 1000 milliseconds in a second * 60 seconds * 60 minutes in hour * 24 hours in day * 7 days
    }
}
app.use(session(sessionconfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
// when using params such as id in express route use express.Router({ mergeParams: true }) to pass params into the router params.

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'swr@gamil.com', username: 'swr' });
    const newUser = await User.register(user, 'password');
    res.send(newUser);
});

// GET /register -> FORM
// POST /register -> create a user
// Login route
// Logout route

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