'use strict';

require('dotenv').config();
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');

const DATABASE_URL= process.env. DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;
const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL };
const client = new pg.Client(options);

client.on('error', err => { throw err; });


const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

// app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
client.connect().then(()=>app.listen(PORT, () => console.log(`Listening on port: ${PORT}`)));







app.get('/', renderIndex);
app.get('/searches/new', (req, res) => res.render('pages/searches/new'));
app.post('/searches', search);
app.get('/books/:id', renderDetalis);
app.put('/books/:id', updateBook);
app.put('/books/:id', deleteBook);
app.post('/books',handlerSave );
app.use('*', handelError);

function deleteBook(req,res){
  const id =req.params.id;
  const sql = 'DELETE FROM books WHERE id=$1';
  
  client.query(sql, [id])
    .then(()=>{
      res.redirect('/');
    });
}

function updateBook(req,res){
  let id = req.params.id;
  let { author,title, isbn, image_url, description} = req.body;
  let sql = `UPDATE tasks SET author=$1,title=$2,isbn=$3,image_url=$4,description=$5 WHERE id =$6;`;
  let values = [author,title, isbn, image_url, description,id];
  client.query(sql,values)
    .then(()=>{
      res.redirect(`/books/${id}`);
    });
}

function handlerSave(req,res){
  const chosenBook =req.body;
  const sql = 'INSERT INTO books (author,title,isbn,image_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
  const values = Object.values(chosenBook);
  console.log(chosenBook);
  console.log(values);
  client.query(sql,values)
    .then(()=>{
      res.render('pages/books/show',{databaseResults:[chosenBook]});
    });
}


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
    .then(results =>res.render('pages/searches/show', { searchResults: results }));
}


function Book(info) {
  this.image = (info.imageLinks&&info.imageLinks.thumbnail) || `https://i.imgur.com/J5LVHEL.jpg`;
  this.title = info.title ? info.title : 'No title was found.';
  this.author = (info.authors) ? info.authors : '....';
  this.description = info.description ? info.description : 'No description found.';
  this.isbn = info.industryIdentifiers ? `${info.industryIdentifiers[0].type} ${info.industryIdentifiers[0].identifier}` : 'No ISBN found';
  Book.all.push(this);
}
Book.all = [];


function handelError(error, res) {
  res.render('pages/error', { error: error });
}

// function addToDB ()


