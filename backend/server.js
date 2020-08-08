// api is accessed by angular application somehow

var express = require('express');
var mongoose = require('mongoose');
var url = require('url');
const cors = require('cors');
var bodyParser = require('body-parser');

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
  id: {type: Number, required:true}
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


// ENABLING CORS STUFF ---------------------------------------------
app.use(cors());
app.get('/with-cors', cors(), (req, res, next) => {
  console.log("testing cors:");
});
// -----------------------------------------------------------------

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/', express.query());
app.get('/', function(req, res){
  console.log("recieved get request: " + req);
  //res.send("hello world");
});

router.post('/', function(req, res, next){
  console.log("got test post");
});

router.route('/create').post(function(req, res, next){
  console.log("got post");
});

app.get('/tasks', function(req, res){
  console.log("request for tasks recieved");
  //var response = Task.find(); // attempting to json-stringify this blows it up
  /*response.exec(function(err, docs){
    console.log("the docs: " + docs);
  });*/
  var response = null;
  Task.find().exec(function(err, docs){
    for(var i in docs){
      console.log(docs[i].name);
    }
    console.log(JSON.stringify(docs));
    res.send(docs);
  })
  /*console.log("sending response: ");
  console.log(response);
  res.send(response);*/
});

app.post('/create', function(req, res){
  console.log("recieved create request: push the object to the tasks array");
  console.log(req.body);
  var response = {msg: "hello from the serverino ;^)"};
  res.send(response);
});



mongoose.connect('mongodb://localhost/todoDB');
const connection = mongoose.connection;

connection.once('open', function(){

  mongoose.connection.db.collection('tasksCollection').countDocuments(function(err, docs){
    console.log("there are " + docs + " docs in the collection\n");

    // if there aren't any docs in the collection, add one for testing purposes
    if(docs == 0){
      var addThis = new Task({
        name: "sample task",
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
      });
    }
  });

  console.log("MongoDB database connection established successfully\n");
});



app.listen(4000, function(req, res){
  console.log("express server listening on port 4000\n");
});
