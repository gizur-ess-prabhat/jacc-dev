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
var request = require('request');

var redis_client = require("redis").createClient();

// set logging level
helpers.logging_threshold  = helpers.logging.debug;

// redis error management
redis_client.on("error", function (err) {
    helpers.logErr("Error " + err);
});



// Globals
//==============



// Functions
//==============


// build
//-------------------------------------------------------------------------------------------------
//
// Equivalent of: curl -H "Content-type: application/tar" --data-binary @webapp.tar http://localhost:4243/build
//

function build(){

    helpers.logDebug('build: Start...');

//    fs.createReadStream('webapp.tar').pipe(request.post('http://localhost:4243/'));
    fs.createReadStream('webapp.tar').pipe(
        request.post(
            'http://localhost:4243/', 
            function (error, response, body) {helpers.logDebug(body);}
        )
    );

    helpers.logDebug('build: data sent...');        
}

// test
//-------------------------------------------------------------------------------------------------
//
// example on howot use jQuery.ajax
//

function test(){

   var request = $.ajax({

        url: 'http://localhost:4243/build',
        type: 'POST',
        contentType: 'application/tar',

        data: '{ "scopes": [ "repo" ], "note": "Created by list-issues.js"  }',


        success: function(data){
            helpers.logDebug('build: Yea, it worked...' + JSON.stringify(data) );
            oauthToken = data;
        },

        error: function(data){
            helpers.logErr('build: Shit hit the fan...' + JSON.stringify(data));

        }
    });

    return request;
}


// main
//-------------------------------------------------------------------------------------------------
//

switch (argv.cmd) {

    case "push":
        helpers.logDebug('main: running build...');
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