'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns")
const validUrl = require('valid-url');
var bodyParser = require('body-parser')
let mongoose = require("mongoose")
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });
const { Schema } = mongoose
const urlSchema = new Schema({
  website:String,
  shortURL:Number
})
const Url = mongoose.model("Url",urlSchema)
app.use(bodyParser.urlencoded({extended: false}))
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.get('/api/shorturl/:sUrl', function(req, res) {
  if(req.params.sUrl.length == 9)
  {
    console.log("Nohing")
     res.status(401).json({
      error: 'invalid URL'
    })
  }
  else{
    let sURL = parseInt(req.params.sUrl)
    console.log("Short: ",req.params.sUrl.length)
  Url.findOne({shortURL:sURL},function(err,response){
   if(err)
    console.log(err)
   else{
     if(response){
       res.redirect(response.website)
     }
   }   
  })
  }  

  
});
app.post("/api/shorturl",function(req,res){
  let webParse = req.body.url
  // if(!webParse){
  //   res.json({error:"invalid url"})
  // }
  if (!validUrl.isWebUri(webParse)) {
    console.log("tatatatata1")
     res.json({
      error: 'invalid URL'
    })
  }
  // console.log("web "+webParse)
  // let url = webParse.split("/")                            
  // let website = url[url.length-1]
  else{
    console.log("tatatatata2")
    urlCheck(webParse,cb,res)
  }  
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});



function urlCheck(webParse,cb,res){
  // console.log("web "+webParse)
  let url = webParse.split("/")                            
  let website = url[2]
  console.log(website)
  console.log(url)
    dns.lookup(website,function(err,address,family){
    if(err){
      console.log(err)
    res.status(401).json({
      error: 'invalid URL'
    })  
    }
      
    else{      
      // console.log(webParse)
      Url.findOne({website:webParse},function(err,result){
        console.log("urlCheck")
        if(err)
          console.log(err)
        else{
          if(!result){
            let randomNumber = Math.floor((Math.random() * 10000) + 1)
            cb(webParse,randomNumber,res)            
          }
          //If data already present.
          else{
            console.log("Test 1")
            res.json({original_url:webParse,short_url:result.shortURL})
          }          
        }
      })      
    }
  })
}
function cb(webParse,randomNumber,res){
  Url.findOne({shortURL:randomNumber},function(err,result){
    console.log("cb")
    if(err)
      res.status(401).json({
      error: 'invalid URL'
    })
    else{
      if(result){
        let randomNumber = Math.floor((Math.random() * 10000) + 1)
        cb(webParse,randomNumber)
      }
      else{
        let url = new Url({
          website:webParse,
          shortURL:randomNumber
        })
        url.save(function(err,data){
          if(err)
            console.log(err)
          else{
            console.log("Test 2")
            res.json({original_url:data.website,short_url:data.shortURL})
          }          
        })
      }
    }
  })
}