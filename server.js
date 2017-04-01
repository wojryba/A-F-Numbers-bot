const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
require('dotenv').config();

const port = process.env.PORT || 3000

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/'));

app.get('/', function(req, res){
  res.sendFile('./index.html', {root: __dirname});
})

app.get('/slack', function(req, res){
  let data = {form: {
    client_id: process.env.SLACK_ID,
    client_secret: process.env.SLACK_SECRET,
    code: req.query.code
  }};
  console.log(data);
  request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // You are done.
      // If you want to get team info, you need to get the token here
      let token = JSON.parse(body).access_token; // Auth token
            // Get the team domain name to redirect to the team URL after auth
      request.post('https://slack.com/api/team.info', {form: {token: token}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          if(JSON.parse(body).error == 'missing_scope') {
            res.send("App was added to your team");
          } else {
            let team = JSON.parse(body).team.domain;
            res.redirect('https://' +team+ '.slack.com');
          }
        }
      });
    }
  })
})

app.post('/', function(req, res){
  let text = req.body.text;
  let arrText  = text.split(' '); // having arguments by space seperation
  console.log(arrText);
  if (text == "random") {
    request('http://numbersapi.com/random', function (error, response, body){
      console.log('error:', error); // Print the error if one occurred
      res.send(body);
    });
  } else if (text.startsWith("random ") && ["trivia", "date", "math", "year" ].includes(arrText[1])) { //optional words for random command
    request('http://numbersapi.com/random/' + arrText[1], function (error, response, body){
      res.send(body);
    })
  } else if (text.startsWith("random min")) {
    let numbers = text.match(/\d+/g).map(Number);
    console.log(numbers);
    const min = numbers[0];
    const max = numbers[1];
    const url = 'http://numbersapi.com/random?min=' + min + '&max=' + max;
    if (min<max){
      request(url, function (error, response, body){
        console.log("error: ", error);
        res.send(body);
      });
    } else {
      res.send("first number must be smaller!!")
    }
  } else if (text == "help") {
    const help = `USAGE OF THE APP:
    You need to enter "/numbersbot" and word 'random' or a number of your choice.
    This will give you fun fact about number of your choice, or about random number.

    Additionally, you can use optional words: “trivia”, “math”, “date” and "year" with both of them.
    eg. "/numbersbot 42 trivia" or "/numbersbot random math"
    1. math - gives mathematical fact about number,
    2. trivia – gives not mathematical fact about number,
    3. date - gives fan fact about date, date format is MM DD,
    4. year - gives fan fact about year.

    You can also limit the range of random numbers my entering:
    "/numbersbot random min: [#] max: [#]"`;
    res.send(help)

}else if (/\d\d*\D\s*\d*\d/gi.test(arrText[0])) {
    // if first arg has / seperator
      console.log(1)
      let replacedStr = arrText[0].replace(/\D/gi, '/');
      let strArr = replacedStr.split('/');
      if(+strArr[0]>12||+strArr[1]>31||(+strArr[0]==2 && +strArr[1]>29)){
          res.send(" Wrong date please check your month and day!")
      }else{
          request('http://numbersapi.com/'+replacedStr+'/date', function (error, response, body){
            if(response.body=="Invalid url"){
             res.send("please check your month and day ' right format is MM/DD' ")
            }else{
             res.send(body);
            }
        });
      }
  }else if(arrText.length == 3 && !isNaN(arrText[0]) && !isNaN(arrText[1]) && arrText[2]=='date'){
        if(+arrText[0]>12||+arrText[1]>31||(+arrText[0]==2 && +arrText[1]>29)){
            res.send("please check your month and day ' right format is MM/DD' ")
        }else{
          request('http://numbersapi.com/'+arrText[0]+'/'+arrText[1], function (error, response, body){
            res.send(body);
        });
        }


  }else if(["trivia", "date", "math", "year" ].includes(arrText[1])&&!isNaN(Number(arrText[0]))){
      console.log(2)
        request('http://numbersapi.com/'+arrText[0]+'/'+arrText[1], function (error, response, body){
            res.send(body);
    });
  }else if(!isNaN(Number(arrText[0]))){
      console.log(3)
        request('http://numbersapi.com/'+arrText[0], function (error, response, body){
            res.send(body);
        });
  }else{
    res.send('Wrong command. Try: "/random help" for list of commands')
  }
})

app.listen(port)
