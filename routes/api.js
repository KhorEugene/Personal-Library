/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const connections = 0;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      console.log('> Get function called');
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err,db){
        if(err){
          res.end();
          return console.log('Error connecting to database',err);
        }
        console.log('Successful database connection');
        const dbc = db.db('test').collection('books');
        dbc.find({},{_id:1,title:1,commentcount:1}).toArray(function(err,data){
          if (err) {
            res.end();
            return console.log('Error finding in database',err);
          }
          res.send(data);
          console.log('Successfully found in database');
        });
      db.close(function(err,result){
        if(err){
          return console.log('Error in closing connection');
        }
        console.log('Successfully closed connection');
      });
      })
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      console.log('> Post function called');
      const obj = {title,commentcount:0,comments:[]};
      if(title==''){
        console.log('No title inserted');
        return res.send('Please insert title')
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err,db){
        if(err){
          res.end();
          return console.log('Error connecting to database',err);
        }
        console.log('Successful database connection');
        const dbc = db.db('test').collection('books');
        dbc.insertOne(obj,function(err,data){
          if(err){
            res.end();
            return console.log('Error adding '+obj.title+' to database',err);
          }
          res.json(obj);
          console.log(obj.title+' added to database')
        })
        db.close(function(err,result){
        if(err){
          return console.log('Error in closing connection');
        }
        console.log('Successfully closed connection');
      });
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      console.log('> Delete request called');
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err,db){
        if(err){
          res.end();
          return console.log('Error connecting to database',err);
        }
        console.log('Successful database connection');
        const dbc = db.db('test').collection('books');
        dbc.remove({},function(err,data){
          if(err){
            res.end();
            return console.log('Error in removing document from database',err);
          }
          res.send('Complete delete successful');
          console.log(data.result.n+' documents deleted');
        })
        db.close(function(err,result){
        if(err){
          return console.log('Error in closing connection');
        }
        console.log('Successfully closed connection');
      });
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      console.log('> Get function called');
      if(bookid.length!=24){
        console.log('Invalid bookid returned')
        return res.json('Invalid bookid inputted')
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err,db){
        if(err){
          res.end();
          return console.log('Error connecting to database',err);
        }
        console.log('Successful database connection');
        const dbc = db.db('test').collection('books');
        dbc.findOne({_id:ObjectId(bookid)},function(err,data){
          if(err){
            res.end();
            return console.log('Error finding in database',err);
          }
          if(data==null){
            console.log('No book exists with id '+ bookid);
            return res.send('No book exists');
          }
          res.send(data);
          console.log(data.title+' found')
        })
        db.close(function(err,result){
        if(err){
          return console.log('Error in closing connection');
        }
        console.log('Successfully closed connection');
      });
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      console.log('> Post function called');
      if(bookid.length!=24){
        console.log('Invalid bookid returned')
        return res.json('Invalid bookid inputted')
      }
      if(comment==''){
        console.log('No comment input');
        return res.json('No comment input');
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err,db){
        if(err){
          res.end();
          return console.log('Error connecting to database',err);
        }
        console.log('Successful database connection');
        const dbc = db.db('test').collection('books');
        dbc.findOneAndUpdate({_id:ObjectId(bookid)},{
            $push:{comments:comment},
            $inc:{commentcount:1}
          },{
            returnOriginal:false
          },function(err,data){
            if(err){
              res.end();
              return console.log('Error in updating document',err);
            }
            if(data.value == null){
              res.send('No book exists')
              return console.log('No book exists with id '+ bookid)
            }
            res.send(data.value);
            console.log('Successfully updated document');
        })
        db.close(function(err,result){
        if(err){
          return console.log('Error in closing connection');
        }
        console.log('Successfully closed connection');
      });
      })
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      console.log('> Delete request called');
      if(bookid.length!=24){
        console.log('Invalid bookid returned')
        return res.json('Invalid bookid inputted')
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err,db){
        if(err){
          res.end();
          return console.log('Error connecting to database',err);
        }
        console.log('Successful database connection');
        const dbc = db.db('test').collection('books');
        dbc.remove({_id:ObjectId(bookid)},{justOne:true},function(err,data){
          if(err){
            res.end();
            return console.log('Error in removing document from database',err);
          }
          if(data.result.n==0){
            res.send('ERROR: Unsuccessful deletion');
            return console.log('Error in deletion');
          } else {
          res.send('Delete successful');
          console.log('Successful deletion of '+bookid);
          }
        })
        db.close(function(err,result){
        if(err){
          return console.log('Error in closing connection');
        }
        console.log('Successfully closed connection');
      });
      })
    });
  
};
