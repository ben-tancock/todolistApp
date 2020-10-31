// this is going to load in all of our environment variables and set them inside process.env
/*if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}*/

var express = require('express');
var cors = require('cors');
//var csp = require('content-security-policy');
var app = express();
var dotenv = require('dotenv');
dotenv.config();

var url = require('url');

var cors_proxy = require('cors-anywhere');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session'); // should give us persistent sessions...
var passport = require('passport');
var ejs = require('ejs');
var bcrypt = require('bcrypt');
var flash = require('express-flash');
var mongoose = require('mongoose');
var path = require('path');
//const env = require('./src/environments/environment');
//const methodOverride = require('method-override')
//var initializePassport = require('passport-config');
var initializePassport = require('./passport-config');
// this completes passport authentication strategy
// passes passport, a function for finding a user by their username,
// and a function for finding a user by id to the initialize() function inside passport-config
// the authenticateUser function then uses these methods to get what it needs
var connurl = '';
if(process.env.NODE_ENV == 'development'){
  connurl = 'http://localhost:4200';
}
else{
  connurl = 'https://cors-anywhere.to-do-bentancock.herokuapp.com';
}

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
app.use(cookieParser('process.env.SECRET'));

var cspPolicy = {
  'default-src': 'self, https://to-do-bentancock.herokuapp.com/*',
  'img-src': '*',
}

/*app.use(csp({
  policies: {
    'default-src': [csp.NONE],
    'img-src': [csp.SELF],
  }
}));

const globalCSP = csp.getCSP(cspPolicy);
app.use(globalCSP)

*/

app.use(session({
  secret: 'process.env.SECRET',
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
    ttl: 60 * 60, // keeps the session open for 1 hour
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

app.use(cors({credentials: true, origin: true}));
/*app.use(cors({credentials: true, origin: function(req, callback){
  var corsOptions;
  console.log("origin req: %j" , req);
  console.log(JSON.stringify(req));
  if(req.includes(connurl)){
    console.log("req includes connurl")
    console.log("CSP stuff: %j", globalCSP)
    corsOptions={origin: req}
  }else{
    corsOptions={origin: false}
  }
  callback(null, corsOptions);
  }
}));*/

// enables pre-flight requests across the board
app.options('*', cors()) // include before other routes

app.get('/with-cors', cors(), (req, res, next) => {
  console.log("testing cors:");
});
// -----------------------------------------------------------------



app.use(flash());
app.use('/', express.query());


// why do we even need this?
app.use(express.static(__dirname + '/dist/to-do-heroku'));
app.get(__dirname + '/dist/to-do-heroku', function(req, res){
  console.log("testing __dirname get request!");
});

app.get('/*', function(req,res) {
  res.header("Access-Control-Allow-Origin", connurl);
  res.header('Access-Control-Allow-Credentials', true);
  //res.header('Content-Type', 'application/json');
  console.log("here's what app.get is receiving: " + req.url);
  console.log("sending file!");
  res.sendFile(path.join(__dirname + '/dist/to-do-heroku/index.html'));
});

app.post('/loginCheck', function(req, res){
  res.header("Access-Control-Allow-Origin", connurl);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Content-Type', 'application/json');

  console.log("res header: %j", res.getHeaders());
  console.log("\nlogin check");
  if(req.isAuthenticated()){
    console.log("authentication returns true!");
    //console.log("printing req passport data: ");
    //console.log(req.session);
    //console.log(req.user);
    //res.headersSent();
    res.send({authenticated: true});
  }
  else{
    console.log("user is not authenticated");
    res.send({authenticated: false});
  }
});

/*app.post('/login', passport.authenticate('local',
  {
    successMessage: 'success',
    failureMessage: 'fail'
  }),
  function(req, res){
    console.log("\nuser logged in");
    res.send({status: 'success'});
    //once logged in, the client must find another way to get the tasks
  }
);*/

app.post('/login', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", connurl);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Content-Type', 'application/json');
  console.log("res header: %j", res.getHeaders());
  passport.authenticate('local', function(err, user, info) {
    console.log("printing error: " + err);
    console.log("passport info: " + JSON.stringify(info)); // undefined
    if(err){
      console.log("error authenticating!");
      res.send({status: 'error logging in user'});
      return;
    }

    if(!err){
      req.logIn(user, function(err){
        if(err){
          console.log("error logging in");
          //return
        }
        res.send({status: 'success'});
      });
    }
  })(req, res, next);
});

app.post('/logout', checkAuthenticated, async function(req, res){
  res.header("Access-Control-Allow-Origin", connurl);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Content-Type', 'application/json');
  console.log("\nlogging out user");
  await req.logout(); // logOut or logout??
  res.send({status: 'redirect', url: '/login'});
});


app.post('/getTasks', checkAuthenticated, function(req, res){
    res.header("Access-Control-Allow-Origin", connurl);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Content-Type', 'application/json');
    console.log("\n Successful authentication, request: " + JSON.stringify(req.body));

    Users.find({id: { $eq: req.session.passport.user}}, function(err, doc){
      if(!doc.length || doc == null){ // if the user is not found
        console.log("ERROR: USER NOT FOUND, LOGGING OUT");
        req.logOut();
        res.send({error:'not found'}); // send some kind of message back to client-side
      }
      else{
        res.send({tasks: doc[0].tasks, idCount: doc[0].idCount});
      }

    });
});

// this method is done when the user clicks the 'register' button
app.post('/register', async (req, res) => {
  res.header("Access-Control-Allow-Origin", connurl);
  res.header('Access-Control-Allow-Credentials', true);
  //res.header('Content-Type', 'application/json');

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
          console.log("\nsuccessfully inserted and registered: " + JSON.stringify(result.ops[0].username));
          res.send({data: result, status: 'success'});
        }
        else{
          console.log("\nerror inserting object: " + req.body);
          res.send({data: result, status: 'failed'});
        }
      });
    } catch {
      console.log("catch!\n")
    }
  }
});


app.post('/create', checkAuthenticated, function(req, res){
  res.header("Access-Control-Allow-Origin", connurl);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Content-Type', 'application/json');
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
  res.header("Access-Control-Allow-Origin", connurl);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Content-Type', 'application/json');
  //console.log("\nreq.session.passport for deleteTask: " + JSON.stringify(req.session.passport));
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


var uri = '';
if(process.env.NODE_ENV == 'development'){
  uri = 'mongodb://localhost/todoDB'
}
else{
  uri = "mongodb+srv://todoApp:7211@cluster0.huawl.mongodb.net/toDoDB?retryWrites=true&w=majority";
}


//const uri = "mongodb+srv://todoApp:7211@cluster0.huawl.mongodb.net/toDoDB?retryWrites=true&w=majority";
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
    console.log("user is authenticated!");
    return next();
  }
  console.log("WARNING: USER NOT AUTHENTICATED");
  res.send({authenticated: false});
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



if(process.env.NODE_ENV == 'development'){
  app.listen(4000, function(req, res){
    console.log("express server listening on port 4000");
  });
}
else{
 /* app.listen(process.env.PORT || 8080, function(req, res){
    console.log("express server listening on port 8080");
  });*/

  cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin'],
    removeHeaders: ['cookie', 'cookie2']
  }).listen(process.env.PORT, 'https://haunted-goblin-14104.herokuapp.com', function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
  });

}


