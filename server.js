var express = require('express');
var cors = require('cors');
var app = express();
var dotenv = require('dotenv');
dotenv.config();
var url = require('url');
var USER_SUBSCRIPTIONS = [];
const webpush = require('web-push');


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
  connurl = 'https://to-do-bentancock.herokuapp.com';
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

const vapidKeys = webpush.generateVAPIDKeys();
console.log("vapid keys: ", vapidKeys);

webpush.setVapidDetails(
  'mailto:https://to-do-bentancock.herokuapp.com/', //'mailto:https://localhost:4200', use this when testing push notifs locally
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('process.env.SECRET'));

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
  subscription: {type: Object, required: true},

  // Array of tasks
  tasks: [taskSchema]
}, {collection: 'usersCollection'});

const Users = mongoose.model('Users', userSchema);
const usersCollection = mongoose.connection.collection('usersCollection');


// ENABLING CORS STUFF ---------------------------------------------

app.use(cors({credentials: true, origin: connurl}));

// enables pre-flight requests across the board
app.options('*', cors()) // include before other routes

app.get('/with-cors', cors(), (req, res, next) => {
  console.log("testing cors:");
});
// -----------------------------------------------------------------



app.use(flash());
app.use('/', express.query());


// push notification stuff: --------------------------------------------------------------------------------------------------------------------------
// String
/*notifier.notify('Message');
// Object
notifier.notify({
  title: 'My notification',
  message: 'Hello, there!'
});*/

// ---------------------------------------------------------------------------------------------------------------------------------------------------



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

app.post('/vkeys', cors(), checkAuthenticated, function(req, res){
  console.log("TEST VKEYS");
  console.log(vapidKeys);
  res.send({keys:vapidKeys});
})

app.post('/addPushNotifications', cors(), checkAuthenticated, function(req, res ){
  console.log("TEST NOTIFICATIONS");
  const sub = req.body;
  console.log('Received Subscription on the server: ', sub);
  USER_SUBSCRIPTIONS.push(sub);

  Users.findOneAndUpdate({id: { $eq: req.session.passport.user}}, {$set: {subscription: sub}}, function(err, result){
    if(err){
      console.log("error finding and updating! \n");
      res.send("error finding and updating");
    }
    else{
      console.log("SUB OBJECT SET IN USER");
      //console.log(result);
      res.status(200).json({message: "Subscription added successfully."});
     // res.send({status: "success", task: req.body.task, idCount: result.idCount});
    }
  });

  /*Users.find({id: { $eq: req.session.passport.user}}, function(err, doc){
    if(!doc.length || doc == null){ // if the user is not found
      console.log("ERROR: USER NOT FOUND, LOGGING OUT");
      req.logOut();
      res.send({error:'not found'}); // send some kind of message back to client-side
    }
    else{ // if the user is found
      //res.send({tasks: doc[0].tasks, idCount: doc[0].idCount});
      console.log("user object: ", doc);
      console.log("SUB OBJECT SET IN USER");

      doc.subscription = sub;
      doc.save();
      console.log(doc);
    }
  });*/


});

app.post('/scheduleNotification', cors(), checkAuthenticated, function(req, res){
  // sample notification payload
  const notificationPayload = {
    "notification": {
      "title": "Angular News",
      "body": "Newsletter Available!",
      "icon": "assets/main-page-logo-small-hat.png",
      "vibrate": [100, 50, 100],
      "data": {
          "dateOfArrival": Date.now(),
          "primaryKey": 1
      },
      "actions": [{
          "action": "explore",
          "title": "Go to the site"
      }]
    }
  };

  console.log('Total subscriptions', USER_SUBSCRIPTIONS.length);
  console.log('user for notification: ', req.session.passport.user);
  Users.find({id: { $eq: req.session.passport.user}}, function(err, doc){
    if(!doc.length || doc == null){ // if the user is not found
      console.log("ERROR: USER NOT FOUND, LOGGING OUT");
      req.logOut();
      res.send({error:'not found'}); // send some kind of message back to client-side
    }
    else{ // if the user is found
      //res.send({tasks: doc[0].tasks, idCount: doc[0].idCount});
      console.log("the user we found: ", JSON.stringify(doc));
      console.log(doc[0].subscription);
      webpush.sendNotification(doc[0].subscription, JSON.stringify(notificationPayload) )
        .then(() => res.status(200).json({message: 'Newsletter sent successfully.'}))
          .catch(err => {
            console.error("Error sending notification, reason: ", err);
            res.sendStatus(500);
          });
    }

  });

  //userIndex = USER_SUBSCRIPTIONS.findIndex(sub => (sub.))

  /*Promise.all(USER_SUBSCRIPTIONS.map(sub => webpush.sendNotification(
    sub, JSON.stringify(notificationPayload) )))
    .then(() => res.status(200).json({message: 'Newsletter sent successfully.'}))
    .catch(err => {
        console.error("Error sending notification, reason: ", err);
        res.sendStatus(500);
    });*/

});

/*app.post('/notify', cors(), checkAuthenticated, function(req, res){
  console.log('test notify');
  // String
  notifier.notify('Message');

  // Object
  notifier.notify({
    title: 'My notification',
    message: 'Hello, there!'
  });

  res.send({});
});
*/

app.post('/loginCheck', cors(), function(req, res){
  res.header("Access-Control-Allow-Origin", connurl);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Content-Type', 'application/json');

  console.log("res header: %j", res.getHeaders());
  console.log("\nlogin check");
  if(req.isAuthenticated()){
    console.log("authentication returns true!");
    res.send({authenticated: true});
  }
  else{
    console.log("user is not authenticated");
    res.send({authenticated: false});
  }
});


app.post('/login', cors(), function(req, res, next) {
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

app.post('/logout', cors(), checkAuthenticated, async function(req, res){
  res.header("Access-Control-Allow-Origin", connurl);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Content-Type', 'application/json');
  console.log("\nlogging out user");
  await req.logout();
  res.send({status: 'redirect', url: '/login'});
});




app.post('/getTasks', cors(), checkAuthenticated, function(req, res){
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
app.post('/register', cors(), async (req, res) => {
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


app.post('/create', cors(), checkAuthenticated, function(req, res){
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
app.post('/deleteTask/*', cors(),  checkAuthenticated, function(req, res){
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
  app.listen(8080, function(req, res){
    console.log("express server listening on port 4000");
  });
}
else{
  app.listen(process.env.PORT || 8080, function(req, res){
    console.log("express server listening on port 8080");
  });

}
