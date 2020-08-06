// api is accessed by angular application somehow

var express = require('express');
var mongoose = require('mongoose');
var url = require('url');


const app = express();
const router = express.Router();

app.use('/', express.query());
app.get('/', function(req, res){
  res.send("hello world");
});

mongoose.connect('mongodb://localhost/todoDB');
const connection = mongoose.connection;

connection.once('open', function(){
  console.log("MongoDB database connection established successfully");
});

app.listen(4000, function(req, res){
  console.log("express server listening on port 4000");
});
