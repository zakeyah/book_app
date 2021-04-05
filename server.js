'use strict';

require('dotenv').config();
const express = require('express');
const pg = require('pg');
// const { title } = require('node:process');
const superagent = require('superagent');

const DATABASE_URL= process.env. DATABASE_URL;
const client = new pg.Client(DATABASE_URL);

client.on('error', err => { throw err; });


const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
client.connect().then(()=>app.listen(PORT, () => console.log(`Listening on port: ${PORT}`)));







app.get('/', renderIndex);
app.get('/searches/new', (req, res) => res.render('pages/searches/new'));
app.post('/searches', search);
app.get('/book/:id', renderDetalis);
app.use('*', handelError);


function renderDetalis(req,res){
  const bookId = req.params.id;
  const sql = 'SELECT * FROM books WHERE id=$1;';
  client.query(sql,[bookId])
    .then(data=>{
      res.render('pages/books/show',{databaseResults:data.rows});
    });
}

function renderIndex(req,res){
  const sql ='SELECT * FROM books';
  client.query(sql)
    .then(data=>{
      res.render('pages/index',{databaseResults:data.rows});
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('So sorry, something went wrong.');
    });
}


function search(req,res){
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';


  if (req.body.search_by === 'title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.search_by === 'author') { url += `+inauthor:${req.body.search[0]}`; }
  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => res.render('pages/searches/show', { searchResults: results }));
}


function Book(info) {
  this.image = (info.imageLinks&&info.imageLinks.thumbnail) || `https://i.imgur.com/J5LVHEL.jpg`;
  this.title = info.title ? info.title : 'No title was found.';
  this.author = (info.authors) ? info.authors : '....';
  this.dicription = info.description ? info.description : 'No description found.';
  this.isbn = info.industryIdentifiers ? `${info.industryIdentifiers[0].type} ${info.industryIdentifiers[0].identifier}` : 'No ISBN found';
  Book.all.push(this);
}
Book.all = [];


function handelError (req, res) {
  res.status(500).send('Error');
}

// function addToDB ()


