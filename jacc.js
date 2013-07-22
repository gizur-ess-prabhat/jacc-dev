#!/usr/bin/env node

// mycloud.js
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
var redis_client = require("redis").createClient();
var http = require('http');

// set logging level
helpers.logging_threshold  = helpers.logging.debug;

// redis error management
redis_client.on("error", function (err) {
    helpers.logErr("Error " + err);
});



// Globals
//==============

var hostname = "localhost",
    port = 4243;

// Functions
//==============


// build
//-------------------------------------------------------------------------------------------------
//
// Equivalent of: curl -H "Content-type: application/tar" --data-binary @webapp.tar http://localhost:4243/build
//

function build(){

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

      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        helpers.logDebug('build: BODY: ' + chunk);
      });

    });

    req.on('error', function(e) {
      helpers.logErr('build: problem with request: ' + e.message);
    });

    req.on('end', function(e) {
      helpers.logDebug('build: RECIEVED END, SHOULD EXIT: ' + e.message);
    });

    // write data to the http.ClientRequest (which is a stream) returned by http.request() 
    var fs = require('fs');
    fs.createReadStream('webapp.tar').pipe(req);

    helpers.logDebug('build: Data sent...');        
}


// createContainer
//-------------------------------------------------------------------------------------------------
//
// create a container with the new image
// curl -H "Content-Type: application/json" -d @create.json http://localhost:4243/containers/create
// {"Id":"c6bfd6da99d3"}

function createContainer(){

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
     "Image":"e29f1e430a8e",
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

      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        helpers.logDebug('createContainer: BODY: ' + chunk);
      });

    });

    req.on('error', function(e) {
      helpers.logErr('createContainer: problem with request: ' + e.message);
    });

    req.on('end', function(e) {
      helpers.logDebug('createContainer: RECIEVED END, SHOULD EXIT: ' + e.message);
    });

    // write data to the http.ClientRequest (which is a stream) returned by http.request() 
    var fs = require('fs');
    fs.createReadStream('webapp.tar').pipe(req);

    helpers.logDebug('createContainer: Data sent...');        
}

// main
//-------------------------------------------------------------------------------------------------
//

switch (argv.cmd) {

    case "push":
        helpers.logDebug('push: running build...');
        build();
        break;

    case "help":
        console.log('push: webapp.tar in the current directory will be deployed to the cloud');
        console.log('help: show this message');
        break;

    case "status":
        helpers.logWarning('Not implemented yet!');
        break;

    default:
        helpers.logErr('No such command: ' + argv.cmd);

}

}());