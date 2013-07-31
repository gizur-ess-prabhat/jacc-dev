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

    //var $       = require('jQuery');
    var helpers = require('helpersjs').create();
    var argv    = require('optimist')
                    .usage('Usage: ./app.js --cmd [push|status|help]')
                    .demand(['cmd'])
                    .argv;
    var fs      = require('fs');
    //var redis   = require("redis").createClient();
    var http    = require('http');
    var async   = require('async');

    // set logging level
    helpers.logging_threshold  = helpers.logging.debug;

    // redis error management
    /*redis.on("error", function (err) {
        helpers.logErr("Error " + err);
    });*/


    // Globals
    //==============

    var hostname  = "localhost",
        port      = 4243,
        image     = "581ef261945e",
        container = "6b7d33a7575b";


    // Functions
    //==============


    // build
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -H "Content-type: application/tar" --data-binary @webapp.tar http://localhost:4243/build
    //

    this._build = function(asyncCallback){

        helpers.logDebug('build: Start...');

        var options = {
          hostname: hostname,
          port: port,
          path: '/build',
          method: 'POST'
        };

        var req = http.request(options, function(res) {
          helpers.logDebug('build: STATUS: ' + res.statusCode);
          helpers.logDebug('build: HEADERS: ' + JSON.stringify(res.headers));
          helpers.logDebug('build: options: ' + JSON.stringify(options));

          res.setEncoding('utf8');

          res.on('data', function (chunk) {
            helpers.logInfo('build: ' + chunk);

            // The last row looks like this 'Successfully built 3df239699c83'
            if (chunk.slice(0,18) === 'Successfully built') {
                image = chunk.slice(19,31);

                helpers.logDebug('build: Build seams to be complete');
            }
          });

          res.on('end', function () {
            helpers.logDebug('build: res received end');
            asyncCallback(null, 'image:'+image);
          });

        });

        req.on('error', function(e) {
            helpers.logErr('build: problem with request: ' + e.message);
            process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('build: recieved end - : ' + e.message);
       });

        // write data to the http.ClientRequest (which is a stream) returned by http.request() 
        var fs = require('fs');
        var stream = fs.createReadStream('webapp.tar');

        // Close the request when the stream is closed
        stream.on('end', function() {
          helpers.logDebug('build: stream received end');
          req.end();
        });

        // send the data
        stream.pipe(req);

        helpers.logDebug('build: Data sent...');
    };


    // createContainer
    //-------------------------------------------------------------------------------------------------
    //
    // create a container with the new image
    // curl -H "Content-Type: application/json" -d @create.json http://localhost:4243/containers/create
    // {"Id":"c6bfd6da99d3"}

    this._createContainer = function(asyncCallback){

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

        var req = http.request(options, function(res) {
            helpers.logDebug('createContainer: STATUS: ' + res.statusCode);
            helpers.logDebug('createContainer: HEADERS: ' + JSON.stringify(res.headers));
            helpers.logDebug('createContainer: options: ' + JSON.stringify(options));

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                helpers.logInfo('createContainer: ' + chunk);

                // The result should look like this '{"Id":"c6bfd6da99d3"}'
                container = JSON.parse(chunk).Id;            
                helpers.logDebug('createContainer: container created with ID: ' + container);
            });

        });

        req.on('error', function(e) {
          helpers.logErr('createContainer: problem with request: ' + e.message);
          process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('createContainer: recieved end - ' + e.message);
            asyncCallback(null, 'container:'+container);
        });

        req.write(JSON.stringify(container));
        req.end();

        helpers.logDebug('createContainer: Data sent...');
   };


    // start
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -H "Content-Type: application/json" -d @start.json http://localhost:4243/containers/c6bfd6da99d3/start
    //

    this._start = function(asyncCallback){

        helpers.logDebug('start: Start...');

        var binds = {
            "Binds":["/tmp:/tmp"]
        };

        var options = {
          hostname: hostname,
          port:     port,
          path:     '/containers/'+container+'/start',
          method:   'POST'
        };

        var req = http.request(options, function(res) {
          helpers.logDebug('start: STATUS: ' + res.statusCode);
          helpers.logDebug('start: HEADERS: ' + JSON.stringify(res.headers));
          helpers.logDebug('start: options: ' + JSON.stringify(options));

          res.setEncoding('utf8');

          res.on('data', function (chunk) {
            helpers.logInfo('start: ' + chunk);
          });

        });

        req.on('error', function(e) {
          helpers.logErr('start: problem with request: ' + e.message);
          process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('start: recieved end - ' + e.message);
            asyncCallback(null, 'started');
        });

        req.end();

        helpers.logDebug('start: Data sent...');        
    };


    // push
    //-------------------------------------------------------------------------------------------------
    //
    // Will build an images, create a container and start the container
    //

    this.push = function(){

        helpers.logDebug('push: Start...');

        //this._build();
        //this._createContainer();
        //this._start();

        async.series([
            function(fn){ this._build(fn); },
            function(fn){ this._createContainer(fn); },
            function(fn){ this._start(fn); },
        ]);

        // Run the async functions one by one
        /*async.series([
            //function(fn){ helpers.logDebug('main: running build()...'); fn(null, 'one');},
            function(fn){ this._build(); fn(null, 'one');},
            //function(fn){ helpers.logDebug('main: build() finished...'); fn(null, 'one');},
            //function(fn){ helpers.logDebug('main: running createContainer()...'); fn(null, 'one');},
            function(fn){ this._createContainer(); fn(null, 'one');},
            //function(fn){ helpers.logDebug('main: createContainer() finished...'); fn(null, 'one');},
        ]);*/

        helpers.logDebug('push: End of function, async processing will continue');
    };


    // main
    //-------------------------------------------------------------------------------------------------
    //

    switch (argv.cmd) {

        case "push":
            this.push();
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

    // close redis client
    //redis.quit();

}());