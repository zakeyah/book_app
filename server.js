'use strict';

const express = require('express');
const superagent = require('superagent');



const app = express();
const PORT = process.env.PORT || 3000 ;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

app.get('/',(req,res)=> res.render('pages/index'));
app.get('/new',(req,res)=> res.render('pages/searches/new'));




