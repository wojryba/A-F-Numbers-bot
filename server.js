const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const port = process.env.PORT || 3000

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
  res.send("I work");
})

app.post('/', function(req, res){
  let text = req.body.text;
  console.log(text);
  if (text == "random") {
    request('http://numbersapi.com/random', function (error, response, body){
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
      res.send(body);
    });
  } else {
    res.send('Wrong command. Try: "/number random" for list of options');
  }
})

app.listen(port)
