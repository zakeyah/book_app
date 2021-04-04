'use strict';

const express = require('express');
// const { title } = require('node:process');
const superagent = require('superagent');



const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

app.get('/', (req, res) => res.render('pages/index'));
app.get('/searches/new', (req, res) => res.render('pages/searches/new'));

app.post('/searches', search);

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
  this.title = info.title;
  this.author = info.authors;
  this.dicription = info.description;
  Book.all.push(this);
}
Book.all = [];



