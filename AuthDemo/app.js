let express = require("express"),
  app     = express(),
  path    = require("path"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  passport  = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  User                  = require("./models/users");


//configuration
mongoose.connect('mongodb://localhost/auth_demo_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
 
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Routes
app.get("/", (req, res)=>{
  res.render("home");
});


app.get("/secret", isLoggedIn, (req, res)=>{
  res.render("secret");
});

//Auth Routes
//
//Show sign Up form
app.get("/register",(req,res)=>{
  res.render("register")
});

//handling user sign up
app.post("/register",(req,res)=>{
  User.register(new User({username: req.body.username}),req.body.password,(err, user)=>{
      if(err){
        console.log(err);
        return res.render("register");
      }else{
        passport.authenticate("local")(req, res, ()=>{
           res.redirect("/secret");
        })
      }
  });
});

//Login Routes
app.get("/login",(req, res)=>{
  res.render("login");
});

//login logic
//middleware
app.post("/login", passport.authenticate("local",{ failureRedirect: "/login",}),
  (req, res)=>{
    res.redirect("/secret");
});

app.get("/logout",(req, res)=>{
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect("/login");
  }
};

//Start server
app.listen(3000,()=>{
  console.log("Server started");
});
