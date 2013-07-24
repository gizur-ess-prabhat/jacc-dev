#!/usr/bin/env node

// jacc.js
//------------------------------
//
// 2013-07-19, Jonas Colmsjö
//
// Copyright Gizur AB 2013
//
// Deploy to your private cloud based on docker.io and hipache
//
// Using Google JavaScript Style Guide - http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
//
//------------------------------


// start the new container
// curl -H "Content-Type: application/json" -d @start.json http://localhost:4243/containers/c6bfd6da99d3/start

// Get the logs of the started container (should show the current date since that's all the container does)
// curl -H "Content-Type: application/vnd.docker.raw-stream" -d '' "http://localhost:4243/containers/c6bfd6da99d3/attach?logs=1&stream=0&stdout=1"

// Inspect the container
// curl -G http://localhost:4243/containers/c6bfd6da99d3/json


(function(){

    // Includes
    // ================

    var $       = require('jQuery');
    var helpers = require('./lib/js/helpers.js').create();
    var argv    = require('optimist')
                    .usage('Usage: ./app.js --cmd [push|status|help]')
                    .demand(['cmd'])
                    .argv;
    var fs      = require('fs');
    var redis   = require("redis").createClient();
    var http    = require('http');

    // set logging level
    helpers.logging_threshold  = helpers.logging.debug;

    // redis error management
    redis.on("error", function (err) {
        helpers.logErr("Error " + err);
    });


    // Globals
    //==============

    var hostname = "localhost",
        port = 4243,
        image = "",
        container = "",
        http_req_ongoing = false;


    // Functions
    //==============


    // build
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -H "Content-type: application/tar" --data-binary @webapp.tar http://localhost:4243/build
    //

    this.build = function(){

        helpers.logDebug('build: Start...');

        var options = {
          hostname: hostname,
          port: port,
          path: '/build',
          method: 'POST'
        };

        http_req_ongoing = true;

        var req = http.request(options, function(res) {
          helpers.logDebug('build: STATUS: ' + res.statusCode);
          helpers.logDebug('build: HEADERS: ' + JSON.stringify(res.headers));

          res.setEncoding('utf8');

          res.on('data', function (chunk) {
            console.log('build: ' + chunk);

            // The last row looks like this 'Successfully built 3df239699c83'
            if (chunk.slice(0,18) === 'Successfully built') {
                image = chunk.slice(19,31);

                // 'end' don't seam to be emitted, returning here instead
                //return;
            }
          });

        });

        req.on('error', function(e) {
            helpers.logErr('build: problem with request: ' + e.message);
            process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('build: recieved end - : ' + e.message);
            http_req_ongoing = false;
       });

        // write data to the http.ClientRequest (which is a stream) returned by http.request() 
        var fs = require('fs');
        fs.createReadStream('webapp.tar').pipe(req);

        helpers.logDebug('build: Data sent...');
    };


    // createContainer
    //-------------------------------------------------------------------------------------------------
    //
    // create a container with the new image
    // curl -H "Content-Type: application/json" -d @create.json http://localhost:4243/containers/create
    // {"Id":"c6bfd6da99d3"}

    this.createContainer = function(){

       var container = {
         "Hostname":"",
         "User":"",
         "Memory":0,
         "MemorySwap":0,
         "AttachStdin":false,
         "AttachStdout":true,
         "AttachStderr":true,
         "PortSpecs":null,
         "Tty":false,
         "OpenStdin":false,
         "StdinOnce":false,
         "Env":null,
         "Cmd":[
                 "date"
         ],
         "Dns":null,
         "Image":image,
         "Volumes":{},
         "VolumesFrom":""
        };

        var options = {
          hostname: hostname,
          port: port,
          path: '/containers/create',
          method: 'POST'
        };

        helpers.logDebug('createContainer: Start...');

        http_req_ongoing = true;

        var req = http.request(options, function(res) {
            helpers.logDebug('createContainer: STATUS: ' + res.statusCode);
            helpers.logDebug('createContainer: HEADERS: ' + JSON.stringify(res.headers));

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                console.log('createContainer: ' + chunk);

                // The result should look like this '{"Id":"c6bfd6da99d3"}'
                container = JSON.parse(chunk).Id;            
            });

        });

        req.on('error', function(e) {
          helpers.logErr('createContainer: problem with request: ' + e.message);
          process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('createContainer: recieved end - ' + e.message);
            http_req_ongoing = fasle;
        });

        helpers.logDebug('createContainer: Data sent...');
   };


    // start
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -H "Content-Type: application/json" -d @start.json http://localhost:4243/containers/c6bfd6da99d3/start
    //

    this.start = function(){

        helpers.logDebug('start: Start...');

        var binds = {
            "Binds":["/tmp:/tmp"]
        };

        var options = {
          hostname: hostname,
          port: port,
          path: '/containers/'+container+'/start',
          method: 'POST'
        };

        http_req_ongoing = true;

        var req = http.request(options, function(res) {
          helpers.logDebug('start: STATUS: ' + res.statusCode);
          helpers.logDebug('start: HEADERS: ' + JSON.stringify(res.headers));

          res.setEncoding('utf8');

          res.on('data', function (chunk) {
            console.log('start: ' + chunk);
          });

        });

        req.on('error', function(e) {
          helpers.logErr('start: problem with request: ' + e.message);
          process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('start: recieved end - ' + e.message);
            http_req_ongoing = fasle;
        });

        helpers.logDebug('start: Data sent...');        
    };

    // main
    //-------------------------------------------------------------------------------------------------
    //

    switch (argv.cmd) {

        case "push":

            helpers.logDebug('main: running build()...');
            this.build();

            // Wait fo the build to complete
            while (http_req_ongoing) {
                setTimeout((function() {
                  helpers.logDebug('main: waiting for http request to finish');
                }), 3000);
            }

            helpers.logDebug('main: running createContainer()...');
            this.createContainer();
            
            break;

        case "help":
            console.log('push: webapp.tar in the current directory will be deployed to the cloud');
            console.log('help: show this message');
            break;

        case "status":
            console.log('Not implemented yet!');
            break;

        default:
            console.log('No such command: ' + argv.cmd);

    }

}());