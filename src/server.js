// this is going to load in all of our environment variables and set them inside process.env
/*if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}*/


/*var express = require('express');
var app = express();

var url = require('url');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session'); // should give us persistent sessions...
var passport = require('passport');
var ejs = require('ejs');
var bcrypt = require('bcrypt');
var flash = require('express-flash');
var mongoose = require('mongoose');

//const methodOverride = require('method-override')
//var initializePassport = require('passport-config');
var initializePassport = require('./passport-config');
// this completes passport authentication strategy
// passes passport, a function for finding a user by their username,
// and a function for finding a user by id to the initialize() function inside passport-config
// the authenticateUser function then uses these methods to get what it needs
initializePassport(
  passport,
  // both of these things are functions, passed into passport config
  // I think I pass mongoose middleware stuff here to return the right things
  username => Users.find({username: { $eq: username }}),
  id => Users.find({id: { $eq: id }})
)

var MongoStore = require('connect-mongo')(session);
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser("process.env.SESSION_SECRET"));


app.use(session({
  // this is in your .env file in backend
  // you'll want to generate it as a random string of characters so that it's more secure
  // the longer it is, the more secure it will be
  secret: "process.env.SESSION_SECRET",
  resave: false, // should we reset our session variables if nothing has changed?
  // NOTE: this MUST be set to true otherwise the user authentication / session data won't be saved between middleware methods
  // e.g. if you log in (via /tasks post method), it will print the session data at the end, but if you then do '/create' method right after the req object will be null (because it wasn't saved)
  saveUninitialized: false, // do you want to save an empty value in the session if there is no value?
  cookie: {
    // might want to look into changing this in the future, as cookie stores user stuff
    // for now I have it off until I'm certain I've got all this passport js, cookie and session stuff down pat
    secure: false,
    maxAge: 60000
  },
  store: new MongoStore({
    url: 'mongodb://localhost/todoDB',
    collection: 'sessions'
  })
}));
app.use(passport.initialize());
app.use(passport.session());

// we should maybe look into making a seperate file for the schema stuff, but we'll have it here for now
const taskSchema = new mongoose.Schema({
  name: {type: String, required: true},
  date: {type: String, required: true},
  description: {type: String},
  priority: {type: String},
  id: {type: Number, required:true},
  state: {type: String}
}, {collection: 'tasksCollection'});

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  idCount: {type: Number, required: false},
  id: {type: String, required: true},

  // Array of tasks
  tasks: [taskSchema]
}, {collection: 'usersCollection'});

const Users = mongoose.model('Users', userSchema);
const usersCollection = mongoose.connection.collection('usersCollection');


// ENABLING CORS STUFF ---------------------------------------------
app.use(cors({credentials: true, origin: 'http://localhost:4200'}));
app.get('/with-cors', cors(), (req, res, next) => {
  console.log("testing cors:");
});
// -----------------------------------------------------------------


app.use(flash());

app.use('/', express.query());


app.get('/tasks', function(req, res){
  console.log("this is /tasks\n");
  // need client to send user data,

  Users.findOne({username: { $eq: req.body.user.username}, password: { $eq: req.body.user.password}}).then((user) => {
    res.send(user.tasks);
  });
});

app.get('/loginCheck', checkAuthenticated, function(req, res){
  console.log("\nlogin check");
  if(req.isAuthenticated){
    res.send({authenticated: true});
  }
  else{
    res.send({authenticated: false});
  }
})

app.post('/login', passport.authenticate('local',
  {
    successMessage: 'success',
    failureMessage: 'fail'
  }),
  function(req, res){
    console.log("\nuser logged in");
    res.send({status: 'success'});
    //once logged in, the client must find another way to get the tasks
  }
);

app.get('/logout', checkAuthenticated, function(req, res){
  console.log("\nlogging out user");
  req.logOut();
  // send message to client to redirect
  res.send({status: 'redirect', url: '/login'});
})


app.post('/getTasks', checkAuthenticated, function(req, res){
    // if this function gets called, authentication was successful.
    console.log("\n Successful authentication, request: " + JSON.stringify(req.body));
    //console.log(req.user.tasks); undefined
    console.log(JSON.stringify(req.session.passport.user));
    console.log(req.session.cookie);
    console.log("\n here's the sesssion id: " + JSON.stringify(req.session.id));

    // the only way you can get to the getTasks function is if you log in
    // if you log in you will always have a session object / cookie attached to http requests
    // the session object always contains the user's unique id
    // therefore if you're logged in, we can always get your user data from the session object, regardless of what the client sends to us

    Users.find({id: { $eq: req.session.passport.user}}, function(err, doc){
      if(!doc.length || doc == null){ // if the user is not found
        console.log("ERROR: USER NOT FOUND, LOGGING OUT");
        // send some kind of message back to client-side
        req.logOut();
        res.send({error:'not found'});
      }
      else{
        //console.log("gettasks find operation: " + JSON.stringify(doc));
        //console.log("sending tasks back to user: " + doc[0].tasks);
        res.send({tasks: doc[0].tasks, idCount: doc[0].idCount});
      }

    });
});

// this method is done when the user clicks the 'register' button
app.post('/register', async (req, res) => {
  // TO DO: if a find() req for a user with the req username has a length > 1, send an error message
  let usernameQuery = await Users.find({username: { $eq: req.body.username}});
  console.log(usernameQuery);
  if (usernameQuery.length >= 1){
    console.log("ERROR: there already another user with that username");

    // TO DO: implement client-side response to failed stuff (error messages, proper redirects,  etc.)
    res.send({data: null, status: 'failed'});
  }
  else{
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      req.body.password = hashedPassword;
      console.log("\nnew req pw: " + req.body.password);
      usersCollection.insertOne(req.body, function(err, result){
        if(!err){
          //console.log("\n the result object: " + JSON.stringify(result.ops));
          console.log("\nsuccessfully inserted and registered: " + JSON.stringify(result.ops[0].username));
          res.send({data: result, status: 'success'});
        }
        else{
          console.log("\nerror inserting object: " + req.body);
          res.send({data: result, status: 'failed'});
        }
      });
      //res.redirect('/login')
    } catch {
      //res.redirect('/register')
      console.log("catch!\n")
    }
  }
});


//I can't use passport.authenticate for /create of a task because it requires a username and password, only given for logging in
// the todo component has this info... but is it safe to send over?
// shouldn't I be getting this stuff from a cookie? can I send over / recieve a cookie?

// for task creation, user creation is in /register
app.post('/create', checkAuthenticated, function(req, res){
  console.log("req.session.passport: " + JSON.stringify(req.session.passport));
  Users.findOneAndUpdate({id: { $eq: req.session.passport.user}}, {$push: {tasks: req.body.task}, $inc: {idCount: 1}}, function(err, result){
    if(err){
      console.log("error finding and updating! \n");
      res.send("error finding and updating");
    }
    else{
      res.send({status: "success", task: req.body.task, idCount: result.idCount});
    }
  });
});



// deleting a task (using task ID, given in URL) from a users tasks subarray
app.post('/deleteTask/*', checkAuthenticated, function(req, res){
  console.log("\nreq.session.passport for deleteTask: " + JSON.stringify(req.session.passport));
  console.log("\nhere is the req body data we're dealing with: " + JSON.stringify(req.body));
  // the first thing we need to do is find the user
  // is the client sending the user data over?
  // should now be sending over username and password in a JSON object
  var delId = Number(req.url.split('/')[2]);
  console.log("and here is the task id to delete: " + delId + "\n");

  //find user and delete subdocument with an ID equal to the id given in the url (using $pull operator instead of $push):
  Users.findOneAndUpdate({id: { $eq: req.session.passport.user}}, {$pull: {tasks: {id: {$eq: delId}}}}, function(err, result){
    if(err){
      console.log("error finding and updating! \n");
      res.send("error finding and updating");
    }
    else{
      console.log("successfully deleted task: " + result);
      res.send({status: "success", task: req.body.task, idCount: result.idCount});
    }
  });
});


// mongodb+srv://todoApp:<password>@cluster0.huawl.mongodb.net/<dbname>?retryWrites=true&w=majority
const uri = "mongodb+srv://todoApp:7211@cluster0.huawl.mongodb.net/toDoDB?retryWrites=true&w=majority";
//mongoose.set('usenewUrlParser', true);
mongoose.connect(uri);
const connection = mongoose.connection;

connection.once('open', function(){

  mongoose.connection.db.collection('usersCollection').countDocuments(function(err, docs){
    console.log("there are " + docs + " docs in the collection\n");
  });

  console.log("MongoDB database connection established successfully\n");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("user is authenticated!")
    return next()
  }
  console.log("WARNING: USER NOT AUTHENTICATED");
  res.send({authenticated: false});
  //res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("\nuser IS authenticated, stopping this request...");
    // Send a message back to the client telling it to redirect instead
    //res.send({authenticated: true});
    return;
  }
  //res.send({authenticated: false});
  console.log("user is NOT authenticated");
  next();
}



const PORT = process.env.PORT;
app.listen(process.env.PORT || 8080, function(req, res){
  console.log("the port: " + PORT);
  console.log("express server listening on port 8080");
});*/


const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(__dirname + '/dist/todolist'));
app.get('/*', function(req,res) {
  console.log("server get request");
  res.sendFile(__dirname + '/index.html');});
app.listen(process.env.PORT || 8080, () => {
  console.log("express server listening on some port");
});
