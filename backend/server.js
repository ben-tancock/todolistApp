// this is going to load in all of our environment variables and set them inside process.env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


var express = require('express');
var mongoose = require('mongoose');
var url = require('url');
const cors = require('cors');
var bodyParser = require('body-parser');
var ejs = require('ejs');
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
//const methodOverride = require('method-override')
const initializePassport = require('./passport-config')

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

const app = express();
const router = express.Router();

// this completes passport authentication strategy
// passes passport, a function for finding a user by their username,
// and a function for finding a user by id to the initialize() function inside passport-config
// the authenticateUser function then uses these methods to get what it needs
initializePassport(
  passport,
  // both of these things are functions, passed into passport config
  // I think I pass mongoose middleware stuff here to return the right things
  //Users.find({username: { $eq: req.body.username}, password: { $eq: req.body.password}})

  //email => users.find(user => user.email === email),
  username => Users.find({username: { $eq: username}}),

  // why are we using id? what should we use instead? what is id for in the context of passport?
  // in the function it's used for serialization?
  //id => users.find(user => user.id === id)
  id => Users.find()
)

/*
schema.pre('save', function(next) {
  console.log("%s is about to be saved", this.name);
  next();
});

schema.post('save', function(doc){
  console.log("%s has been saved", doc.name);
  next();
});
*/

// I'm not entirely sure what exporting does in this context...
// you'd only really do this if we put schemas in another file, which we haven't yet...
//exports.taskSchema = taskSchema;

// this is compiling the model for the task object
// the model object acts as a representation of all documents in the collection

// session takes a couple of variables, one of these is a secret, a key that is going to encrypt all of our info for us. we will get this from our environment variables
// create a .env file



app.use(session({
  // this is in your .env file in backend
  // you'll want to generate it as a random string of characters so that it's more secure
  // the longer it is, the more secure it will be
  secret: "process.env.SESSION_SECRET",
  resave: false, // should we reset our session variables if nothing has changed?
  saveUninitialized: false // do you want to save an empty value in the session if there is no value?
}));

app.use(passport.initialize());
app.use(passport.session());



//
// ENABLING CORS STUFF ---------------------------------------------
app.use(cors());
app.get('/with-cors', cors(), (req, res, next) => {
  console.log("testing cors:");
});
// -----------------------------------------------------------------

// we need this because mongoose functions are asynchronous
function getByUsername(uname){
  return Users.find({username: {$eq: uname}}).exec();
  /*Users.find({username: {$eq: uname}}, function(err, result){
    if(err){
      console.log("error finding user by username");
    }
    else{
      callback(result);
      //callback(result);
    }
  });*/
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(flash());

app.use('/', express.query());

app.get('/tasks', function(req, res){
  console.log("this is /tasks\n");
  // need client to send user data,

  Users.findOne({username: { $eq: req.body.user.username}, password: { $eq: req.body.user.password}}).then((user) => {
    res.send(user.tasks);
  });
});

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
    // req.user contains the authenticated user
    // never executes...?
    // it's probably failing because I never do any passport stuff for register?
    console.log("\nrequest: " + req);
  }
);

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    req.body.password = hashedPassword;
    console.log("\nnew req pw: " + req.body.password);
    usersCollection.insertOne(req.body, function(err, result){
      if(!err){
        console.log("\n the result object: " + JSON.stringify(result.ops));
        console.log("\nsuccessfully inserted: " + JSON.stringify(result.ops[0].username));
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
})


/*app.post('/register', function(req, res){
  console.log("server registering user: " + JSON.stringify(req.body));
  // push user into server-side user object array, send response back

  var hashedPassword = bcrypt.hashSync(req.body.password, 10);
  //console.log("this is the hashed password: " + hashedPassword + "\n");

  req.body.password = hashedPassword;
  //console.log("results after hashing: " + JSON.stringify(req.body) + "\n");

  // I'm not exactly sure why usersCollection works for insertion, and Users works for find() operations... questions for later!
  usersCollection.insertOne(req.body, function(err, result){
    if(!err){
      console.log("\n the result object: " + JSON.stringify(result.ops));
      console.log("\nsuccessfully inserted: " + JSON.stringify(result.ops[0].username));
      res.send({data: result, status: 'success'});
    }
    else{
      console.log("\nerror inserting object: " + req.body);
      res.send({data: result, status: 'failed'});
    }
  });
});*/

/*
app.post('/tasks', function(req, res){
  console.log("this is /tasks, here is the req:" + JSON.stringify(req.body) +  "\n");
  Users.find({username: { $eq: req.body.username}, password: { $eq: req.body.password}}).exec(function(err, docs){
    if(err){
      console.log("error finding user! \n");
    }
    else{
      // send back the docs (the docs is 1 entire user object, with the tasks)
      // the user also includes the id count now, no need to send separate id count object
      console.log("the docs: " + docs);
      res.send({tasks: docs[0].tasks, idCount: docs[0].idCount});
    }

  });
});*/



// for task creation, user creation is in /register
app.post('/create', function(req, res){

  // eventually we're going to have to check if more than one user matches for username and pw (for logging in tho, probs not here)
  // alongisde pushing the task to the user subarray of tasks, we also need to increment their idCount variable
  Users.findOneAndUpdate({username: { $eq: req.body.user.username}, password: { $eq: req.body.user.password}}, {$push: {tasks: req.body.task}, $inc: {idCount: 1}}, function(err, result){
    if(err){
      console.log("error finding and updating! \n");
      res.send("error finding and updating");
    }
    else{
      // since we're only creating one task, we only need to send one task back
      console.log("find and update successful!");
      console.log("this is the users id count: " + result.idCount + "\n");

      // we COULD send the whole user object back, but we don't have to, so we probably shouldn't
      res.send({status: "success", task: req.body.task, idCount: result.idCount});
    }
  });
});



// deleting a task (using task ID, given in URL) from a users tasks subarray
app.post('/deleteTask/*', function(req, res){
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
      console.log("result of deletion: " + result);
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
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


app.listen(4000, function(req, res){
  console.log("express server listening on port 4000\n");
});
