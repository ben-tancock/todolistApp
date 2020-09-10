// this is going to load in all of our environment variables and set them inside process.env
/*if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}*/



const express = require('express');
const app = express();

const url = require('url');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session'); // should give us persistent sessions...
const passport = require('passport');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const mongoose = require('mongoose');
const path = require('path');

//const methodOverride = require('method-override')
//var initializePassport = require('passport-config');
const initializePassport = require('./passport-config');
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
  saveUninitialized: true, // do you want to save an empty value in the session if there is no value?
  cookie: {
    // might want to look into changing this in the future, as cookie stores user stuff
    // for now I have it off until I'm certain I've got all this passport js, cookie and session stuff down pat
    secure: false,
    maxAge: 600000
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
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
})//, {collection: 'tasksCollection'});

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
app.use(cors({credentials: true, origin:'https://to-do-bentancock.herokuapp.com/'}));
app.get('/with-cors', cors(), (req, res, next) => {
  console.log("testing cors:");
});
// -----------------------------------------------------------------

app.use(flash());
app.use('/', express.query());


// why do we even need this?
app.use(express.static(__dirname + '/dist/to-do-heroku'));
// we need it to start on heroku
// will it do this with every get?
// instead let's change to '/' and see what happens?
app.get('/', function(req,res) {
  console.log("here's what app.get is receiving: " + req.url);
  console.log("sending file!");
  res.sendFile(path.join(__dirname + '/dist/to-do-heroku/index.html'));
});



app.get('/tasks', function(req, res){
  console.log("this is /tasks\n");
  // need client to send user data,

  Users.findOne({username: { $eq: req.body.user.username}, password: { $eq: req.body.user.password}}).then((user) => {
    res.send(user.tasks);
  });
});


// this won't execute because app.get('/*' ...) fires before it does
app.get('/loginCheck', function(req, res){
  console.log("\nlogin check");
  if(req.isAuthenticated()){
    console.log("authentication returns true!");
    console.log("printing req passport data: ");
    console.log(req.session);
    console.log(req.user);

    res.send({authenticated: true});
  }
  else{
    console.log("user is not authenticated");
    res.send({authenticated: false});
  }
});

// because of the app.use(express.static...) line, a user trying to navigate using /login will execute this (I think)
app.get('/login', function(req, res){
  console.log("test GET login");
  res.send("GET login response");

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
/*app.listen(4000, function(req, res){
  console.log("the port: " + PORT);
  console.log("express server listening on port 8080");
});*/

app.listen(process.env.PORT || 8080, function(req, res){
  console.log("the port: " + PORT);
  console.log("express server listening on port 8080");
});


