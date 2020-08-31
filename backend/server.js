// api is accessed by angular application somehow

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

var idCount = 0;
/*
  a task object has a:
  - name
  - date
  - description
  - priority
  - id
  */

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

  // Array of tasks
  tasks: [taskSchema]
}, {collection: 'usersCollection'});

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
const Task = mongoose.model('Tasks', taskSchema);
const tasksCollection = mongoose.connection.collection('tasksCollection');


<<<<<<< HEAD

=======
// what is the difference between Users and usersCollection again?
>>>>>>> more login stuff!
const Users = mongoose.model('Users', userSchema);
const usersCollection = mongoose.connection.collection('usersCollection');

const app = express();
const router = express.Router();

var idCount = 0;

// ENABLING CORS STUFF ---------------------------------------------
app.use(cors());
app.get('/with-cors', cors(), (req, res, next) => {
  console.log("testing cors:");
});
// -----------------------------------------------------------------

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/', express.query());

app.get('/tasks', function(req, res){
  console.log("this is /tasks\n");
  Task.find().exec(function(err, docs){
    res.send({docs:docs, idCount: idCount});
  });
});


// triggers when after user types in username and pw and clicks 'login' button
<<<<<<< HEAD
app.post('/tasks', function(req, res){
  console.log("this is /tasks\n");
  Task.find().exec(function(err, docs){
    res.send({docs:docs, idCount: idCount});
  });
=======
// req is the user data you need to find the user with the data, and retrieve the users tasks, and then send the tasks to the todo component,
// and then render the todo component html
// some other authentication stuff needs to be done too
app.post('/tasks', function(req, res){
  console.log("this is /tasks, here is the req:" + JSON.stringify(req.body) +  "\n");

  // have to search for users now, not tasks
  /*Task.find().exec(function(err, docs){
    res.send({docs:docs, idCount: idCount});
  });*/

  Users.find({username: { $eq: req.body.username}, password: { $eq: req.body.password}}).exec(function(err, docs){
    if(err){
      console.log("error finding user! \n");
    }
    else{
      console.log("find user method executed without error: " + docs + " \n");
      // send back the docs
      res.send(docs);
    }

  })
>>>>>>> more login stuff!
});


app.get('/tasks/*', function(req, res){
  console.log("this is the url: " + req.url);
  var user = String(req.url.split('/')[1]);
  console.log("request for user" + user  + "tasks recieved\n");
  Task.find().exec(function(err, docs){
    res.send({docs:docs, idCount: idCount});
  });
});

app.post('/create', function(req, res){
  console.log("recieved create request: push the object to the tasks array\n");
  console.log(req.body);
  // to do: update the database of tasks with the task that was created by the user
  // insert into correct user
  // user will be given in url?
  // oh we've done this before in delete, when we parsed the number out of the url, we can parse the user out as well!
<<<<<<< HEAD
=======

  // we will need to find the user object to insert into first
  doc = Users.find({username: {$eq: req.body.username}, password: { $eq: req.body.password}}, function(err, result){
    if(err){
      console.log("error finding user for task creation \n");
    }
    else{
      console.log("found user to insert task into: " + JSON.stringify(result) + "\n");
      //result.tasks.push(req.body);
     // res.send({data: result});
    }
  });

  doc.tasks = doc.tasks.push(req.body);
  /*
>>>>>>> more login stuff!
  tasksCollection.insertOne(req.body, function(err, result){
    if(!err){
      console.log("\n the result object: " + JSON.stringify(result.ops));
      console.log("\nsuccessfully inserted: " + JSON.stringify(result.ops[0].name));
      idCount++;
      console.log("increasing id count: " + idCount);
      res.send({data: result, status: 'success'});
    }
    else{
      console.log("\nerror inserting object: " + req.body);
      res.send({data: result, status: 'failed'});
    }
<<<<<<< HEAD
=======
  });*/
});

app.post('/register', function(req, res){
  console.log("server registering user: " + JSON.stringify(req.body));
  // push user into server-side user object array, send response back

  usersCollection.insertOne(req.body, function(err, result){
    console.log("\nsuccessfully inserted: " + JSON.stringify(req.body));
    if(!err){
      console.log("\n the result object: " + JSON.stringify(result.ops));
      console.log("\nsuccessfully inserted: " + JSON.stringify(result.ops[0].name));
      idCount++;
      console.log("increasing id count: " + idCount);
      res.send({data: result, status: 'success'});
    }
    else{
      console.log("\nerror inserting object: " + req.body);
      res.send({data: result, status: 'failed'});
    }
>>>>>>> more login stuff!
  });
});

app.delete('/*', function(req, res){
  var delId = Number(req.url.split('/')[1]);
  console.log("\nrecieved delete request for task " + delId);

  // we need to cast delId to a Number. (update: works!)
  tasksCollection.deleteOne({id: delId}, function(err, result){
    if(!err){
      console.log("successfully deleted task: " + result);
      res.send({data: result, status: 'success'});
    }
    else{
      console.log("could not delete task: " + result);
      res.send({data: result, status: 'failed'});
    }
  });

});



mongoose.connect('mongodb://localhost/todoDB');
const connection = mongoose.connection;

connection.once('open', function(){

<<<<<<< HEAD
  mongoose.connection.db.collection('tasksCollection').countDocuments(function(err, docs){
=======
  mongoose.connection.db.collection('usersCollection').countDocuments(function(err, docs){
>>>>>>> more login stuff!
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



app.listen(4000, function(req, res){
  console.log("express server listening on port 4000\n");
});
