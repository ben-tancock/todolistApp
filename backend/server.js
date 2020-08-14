// api is accessed by angular application somehow

var express = require('express');
var mongoose = require('mongoose');
var url = require('url');
const cors = require('cors');
var bodyParser = require('body-parser');

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
/*var Schema = mongoose.Schema;
var taskSchema = new Schema({
  name: {type: String, required: true},
  date: {type: String, required: true},
  description: {type: String},
  priority: {type: String},
  id: {type: Number, required:true}
}, {collection: 'tasksCollection'}
);*/


const schema = new mongoose.Schema({
  name: {type: String, required: true},
  date: {type: String, required: true},
  description: {type: String},
  priority: {type: String},
  id: {type: Number, required:true},
  tState: {type: String, required: true}
}, {collection: 'tasksCollection'});

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
const Task = mongoose.model('Tasks', schema);
const tasksCollection = mongoose.connection.collection('tasksCollection');

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
  console.log("request for tasks recieved\n");
  Task.find().exec(function(err, docs){
    res.send({docs:docs, idCount: idCount});
  });
});

app.post('/create', function(req, res){
  console.log("recieved create request: push the object to the tasks array\n");
  console.log(req.body);
  // to do: update the database of tasks with the task that was created by the user
  tasksCollection.insertOne(req.body, function(err, result){
    if(!err){
      console.log("\nsuccessfully inserted " + result.name);
      idCount++;
      console.log("increasing id count: " + idCount);
      res.send({data: result, status: 'success'});
    }
    else{
      console.log("\nerror inserting object: " + req.body);
      res.send({data: result, status: 'failed'});
    }
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

  mongoose.connection.db.collection('tasksCollection').countDocuments(function(err, docs){
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
