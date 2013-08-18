// server.js
//------------------------------
//
// 2013-08-18, Jonas Colmsjö
//
// Copyright Gizur AB 2013
//
// Simple DNS server based on dnsd developed by iriscouch
//
// Using Google JavaScript Style Guide - http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
//
//------------------------------

var dnsd    = require('dnsd'),
    PORT    = 5353,
    helpers = require('helpersjs').create();

function handler(req, res) {

  var question     = res.question[0], 
      hostname     = question.name, 
      length       = hostname.length, 
      ttl          = Math.floor(Math.random() * 3600),
      redis        = require("redis"),
      redis_client = redis.createClient();


  var answer = {};

  if(question.type === 'A') {

    // connect to redis
    redis_client.on("connect", function () {

      // first set the IP for the domain in redis
      redis_client.get("redis-dns:"+hostname, function(redis_err, redis_res) {
        redis_client.quit();

        if(redis_err) {
          helpers.logErr('Redis error:'+redis_err);
        } else {
          if(redis_res.length > 0) {
            answer = {
              name:hostname, 
              type:'A', 
              data:redis_res, 
              'ttl':ttl};

            res.answer.push(answer);
          }
        }
      }.bind(this));
    }.bind(this));

    // redis error management
    redis_client.on("error", function (err) {
      console.log("Redis error: " + err);
    });


  }

  console.log('%s:%s/%s question:%j answer:%j', req.connection.remoteAddress, req.connection.remotePort, req.connection.type, question, answer);

  res.end();
}

helpers.logging_threshold  = helpers.logging.debug;
//helpers.logging_threshold  = helpers.logging.warning;

var server = dnsd.createServer(handler);
console.log('Server running at 127.0.0.1:'+PORT);
server.zone('example.com', 'ns1.example.com', 'us@example.com', 'now', '2h', '30m', '2w', '10m')
      .listen(PORT, '127.0.0.1');
