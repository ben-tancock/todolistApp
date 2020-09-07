// this is going to load in all of our environment variables and set them inside process.env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


var express = require('express');
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
  resave: true, // should we reset our session variables if nothing has changed?
  // NOTE: this MUST be set to true otherwise the user authentication / session data won't be saved between middleware methods
  // e.g. if you log in (via /tasks post method), it will print the session data at the end, but if you then do '/create' method right after the req object will be null (because it wasn't saved)
  saveUninitialized: false, // do you want to save an empty value in the session if there is no value?
  cookie: {
    // might want to look into changing this in the future, as cookie stores user stuff
    // for now I have it off until I'm certain I've got all this passport js, cookie and session stuff down pat
    secure: false
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

// we need this because mongoose functions are asynchronous
function getByUsername(uname){
  return Users.find({username: {$eq: uname}}).exec();
}



app.use(flash());

app.use('/', express.query());


app.get('/tasks', function(req, res){
  console.log("this is /tasks\n");
  // need client to send user data,

  Users.findOne({username: { $eq: req.body.user.username}, password: { $eq: req.body.user.password}}).then((user) => {
    res.send(user.tasks);
  });
});

// this method is done when the user clicks the 'login' button
// the data passed to authenticate is based on the POST request
// the tasks.service is sending: {username: userName, password: pw}
app.post('/tasks', passport.authenticate('local',
  {
    successMessage: 'success',
    failureMessage: 'fail',
    badRequestMessage: 'fail',
    successFlash: 'testing flash',
    failureFlash: 'testing flash'
  }), function(req, res){
    // if this function gets called, authentication was successful.
    console.log("\n Successful authentication, request: " + JSON.stringify(req.body));
    //console.log("user before login: " + req.user);

    // if a user is logged in, passport js will create a user object in req for every request in express.js
    // if a user is logged in, req.user exists
    // passport.authenticate is supposed to invoke req.login automatically
    // why is everything below this being called twice?
    req.logIn(req.user, function(err){
      if(err){
        console.log("ERROR logging in user \n");
        res.send();
      }
      else{
        console.log("\n User LOGGED IN");
        let sendTasks = req.user[0].tasks;
        res.send({tasks: sendTasks, idCount: req.user.idCount});
        //req.user.save();
      }
    });
    console.log("\n here's the sesssion id: " + JSON.stringify(req.session.id));
    /*console.log("\n here's the user: " + req.user);
    console.log("\n HERE IS THE ENTIRE SESSION: " + JSON.stringify(req.session));

    console.log("\n here's the sesssion cookie: " + JSON.stringify(req.session.cookie)); // returns empty */
    // what is the client expecting?
    //console.log("\nsending this back: " + req.user.tasks);
    //res.send({tasks: req.user.tasks, idCount: req.user.idCount});
  }
);

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
  // these console logs make it clear that, when I try and create a task, the server isn't giving the the cookie I want.
  // I want the cookie with the user data. I can't retrieve the shit I want quickly or easily without it
  // Like I could go through the mongodb with the find function right? but what's the point of authentication then?
  // IS that what I'm supposed to do?
  //console.log("\n HERE IS THE ENTIRE CREATE SESSION: " + JSON.stringify(req.session));
  //console.log("\n here's the sesssion id for create: " + req.session.id); // this works!
  //console.log("\n here's the create session cookie: " + JSON.stringify(req.session.cookie)) // the session has a cookie, not the request, also this contains user stuff!


  // alongisde pushing the task to the user subarray of tasks, we also need to increment their idCount variable
  // do we need to find the user anymore? are they stored in the session???
  //console.log("\ncreate task req body: " + JSON.stringify(req.body));
  //console.log("\nreq.user.username: " + req.user.username); // undefined
  //console.log("\nreq.user.id: " + req.user.id); // also undefined!
  //console.log("\nreq.user: " + JSON.parse(req.user)); // is an object, returns error when using json.stringify
  //console.log(JSON.stringify(req.session)); // has passport user id thing

  // thanks to passport js, we have the user object, no need to find?
  // but it's in a cookie, we need the object in the server!
  // we have the user id, use that to find: don't need pw because we're already authenticated!
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
  // the first thing we need to do is find the user
  // is the client sending the user data over?
  // should now be sending over username and password in a JSON object
  console.log("test delete POST!\n this is the delete task data the client is sending: " + JSON.stringify(req.body) + "\n");
  var delId = Number(req.url.split('/')[2]);
  console.log("and here is the task id to delete: " + delId + "\n");

  //find user and delete subdocument with an ID equal to the id given in the url (using $pull operator instead of $push):
  Users.findOneAndUpdate({username: { $eq: req.body.username}, password: { $eq: req.body.password}}, {$pull: {tasks: {id: {$eq: delId}}}}, function(err, result){
    if(err){
      console.log("error finding and deleting task! \n");
      res.send("error finding and deleting task");
    }
    else{
      // since we're only creating one task, we only need to send one task back
      console.log("find and delete task successful! \n");
      console.log("result of deletion: " + result); // is this supposed to be null?
      res.send({status: "success", task: req.body.task});
    }
  });
});



mongoose.connect('mongodb://localhost/todoDB');
const connection = mongoose.connection;

connection.once('open', function(){

  mongoose.connection.db.collection('usersCollection').countDocuments(function(err, docs){
    console.log("there are " + docs + " docs in the collection\n");

    // if there aren't any docs in the collection, add one for testing purposes
    // we don't need to do this anymore
    if(docs == 0){
      idCount = 0;
      /*var addThis = new Task({
        name: "sample task (created whenever the server is connected and detects 0 docs)",
        date: "today",
        description: "lorem ipsum",
        priority: "testing priority",
        id: 0
      });

      addThis.save(function(err){
        if(err){
          console.log("error saving object: " + err);
        }
        else{
          console.log("object succsessfully saved \n");
        }
      });*/
    }
  });

  console.log("MongoDB database connection established successfully\n");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("user is authenticated!")
    return next()
  }
  console.log("WARNING: USER NOT AUTHENTICATED");
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("\nuser IS authenticated, stopping this request...");
    // Send a message back to the client telling it to redirect instead
    return;
    //return res.redirect('/')
  }
  console.log("user is NOT authenticated");
  next()
}


app.listen(4000, function(req, res){
  console.log("express server listening on port 4000\n");
});
