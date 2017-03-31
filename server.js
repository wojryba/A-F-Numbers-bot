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
  } else if (text.startsWith("random min:")) {
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
    const help = `You need to enter "/number" and word 'random' or a number of your choice.
    This will give you fun fact about number of your choice, or about random number.

    Additionally, you can use optional words: “trivia”, “math”, “date” and "year" with both of them.
    eg. "/number 42 trivia" or "/number random trivia"
    1. math - gives mathematical fact about number,
    2. trivia – gives not mathematical fact about number,
    3. date - gives fan fact about date,
    4. year - gives fan fact about year.

    You can also limit the range of random numbers my entering:
    "/number random min: [#] max: [#]"`;
    res.send(help)
  }else if (/\d\d*\/*\-*\.*\\*\_*\d\d*/.test(arrText[0])) {
    // if first arg has / seperator
      let replacedStr = arrText[0].replace(/\/*\-*\.*\\*\_*/g, '/');
      request('http://numbersapi.com/'+replacedStr+'/date', function (error, response, body){
        res.send(body);
    });
  }else if(["trivia", "date", "math", "year" ].includes(arrText[1])&&!isNaN(Number(arrText[0]))){
        request('http://numbersapi.com/'+arrText[0]+'/'+arrText[1], function (error, response, body){
            res.send(body);
    });
  }else if(!isNaN(Number(arrText[0]))){
        request('http://numbersapi.com/'+arrText[0], function (error, response, body){
            res.send(body);
        });
  }else{
    res.send('Wrong command. Try: "/number help" for list of commands')
  }
})

app.listen(port)
