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


(function(){

    // Includes
    // ================

    //var $       = require('jQuery');
    var helpers = require('helpersjs').create();

    var argv    = require('optimist')
                    .usage('Usage: ./app.js --cmd [push|status|help]')
                    .demand(['cmd'])
                    .argv;

    var fs         = require('fs');
    var redis      = require("redis");
    var http       = require('http');
    var async      = require('async');
    var nconf      = require('nconf');
    var prettyjson = require('prettyjson');


    // Some general setup
    // ================

    var hostname,
        port;

    nconf.use('file', { file: __dirname + '/config.json' });
    nconf.load();

    this.hostname = nconf.get('hostname');
    this.port     = nconf.get('port');

    // set logging level
    switch(nconf.get('logging')) {

      case 'debug':
        helpers.logging_threshold  = helpers.logging.debug;
        break;

      case 'warning':
        helpers.logging_threshold  = helpers.logging.warning;
        break;

      default:
        console.log('error: incorrect logging level in config.json - should be warning or debug!');
    }

    helpers.logDebug('setup: hostname: ' + this.hostname + ' port: ' + this.port);


    // Globals
    //==============

    var  _imageID      = "",
        _containerID   = "",
        _name          = "",
        _containerPort,
        _settings      = {};


    // hipache functions
    //======================================================================

    // updateProxy
    //-------------------------------------------------------------------------------------------------
    //
    // Add both frontend and backend to proxy
    //

    this._updateProxy = function(asyncCallback){

      helpers.logDebug('updateProxy: Start...');

      var redis_client = redis.createClient();

      redis_client.on("connect", function () {
          redis_client.rpush("frontend:"+this._name, this._name, redis.print);

          var backend = "http://"+this._settings.NetworkSettings.IPAddress+":"+this._containerPort;

          redis_client.rpush("frontend:"+this._name, 
                             backend, 
                             redis.print);

          redis_client.quit();

          helpers.logDebug('updateProxy: backend - ' + backend);

          if(asyncCallback !== undefined) {
            asyncCallback(null, 'updateProxy:'+ backend);
          }

      }.bind(this));

      // redis error management
      redis_client.on("error", function (err) {
          helpers.logErr("Redis error: " + err);
      });

    };


    // proxyStatus
    //-------------------------------------------------------------------------------------------------
    //
    // Print contents of redis database
    //

    this._proxyStatus = function(asyncCallback){

      helpers.logDebug('_proxyStatus: Start...');

      var redis_client = redis.createClient();

      redis_client.on("connect", function () {

          redis_client.keys("frontend*", function(err, keys) {

            helpers.logDebug('_proxyStatus: redis keys - ' + keys);

            keys.forEach(function (key,i) {
                redis_client.lrange(key, 0,-1, function(err, res) {
                  console.log(key+' - backend:'+res);
                });
            });

            redis_client.quit();

          });

          helpers.logDebug('_proxyStatus: end');

          if(asyncCallback !== undefined) {
            asyncCallback(null, '_proxyStatus completed');
          }

      }.bind(this));

      // redis error management
      redis_client.on("error", function (err) {
          helpers.logErr("Redis error: " + err);
      });

    };


    // Docker functions
    //======================================================================

    this._dockerRemoteAPI = function(options, funcData, asyncCallback){

        helpers.logDebug('_dockerRemoteAPI: Start...');

        options.hostname = this.hostname;
        options.port     = this.port;

        var req = http.request(options, function(res) {
          helpers.logDebug('_dockerRemoteAPI: STATUS: ' + res.statusCode);
          helpers.logDebug('_dockerRemoteAPI: HEADERS: ' + JSON.stringify(res.headers));
          helpers.logDebug('_dockerRemoteAPI: options: ' + JSON.stringify(options));

          res.setEncoding('utf8');

          res.on('data', funcData.bind(this));

          res.on('end', function () {
            helpers.logDebug('_dockerRemoteAPI: res received end');
            if(asyncCallback !== undefined) {
              asyncCallback(null, '_dockerRemoteAPI:');
            }
          }.bind(this));

        }.bind(this));

        req.on('error', function(e) {
          helpers.logErr('_dockerRemoteAPI: problem with request: ' + e.message);
          process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('_dockerRemoteAPI: recieved end - ' + e.message);
        });

        req.end();

        helpers.logDebug('_dockerRemoteAPI: Data sent...');        
    };


    // build
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -H "Content-type: application/tar" --data-binary @webapp.tar http://localhost:4243/build
    //

    this._build = function(asyncCallback){

        helpers.logDebug('build: Start...');

        var options = {
          hostname: this.hostname,
          port: this.port,
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
                this._imageID = chunk.slice(19,31);

                helpers.logDebug('build: Build seams to be complete - image ID: ' + this._imageID );
            }
          }.bind(this));

          res.on('end', function () {
            helpers.logDebug('build: res received end - image ID: ' + this._imageID);
            asyncCallback(null, 'image:'+this._imageID);
          }.bind(this));

        }.bind(this));

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

        if (this._imageID === "") {
          helpers.logErr('createContainer: this._imageID not set');
          process.exit();        
        }

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
         "Dns":null,
         "Image":this._imageID,
         "Volumes":{},
         "VolumesFrom":""
        };

        var options = {
          hostname: this.hostname,
          port: this.port,
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
                this._containerID = JSON.parse(chunk).Id;            
                helpers.logDebug('createContainer: container created with ID: ' + this._containerID);
            }.bind(this));

            res.on('end', function () {
              helpers.logDebug('createContainer: res received end');
              asyncCallback(null, 'container:'+this._containerID);
            }.bind(this));

        }.bind(this));

        req.on('error', function(e) {
          helpers.logErr('createContainer: problem with request: ' + e.message);
          process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('createContainer: recieved end - ' + e.message);
        });

        helpers.logDebug('createContainer: JSON data - ' + JSON.stringify(container));
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

        if (this._containerID === "") {
          helpers.logErr('start: this._containerID not set');
          process.exit();        
        }

        var binds = {
            "Binds":["/tmp:/tmp"]
        };

        var options = {
          hostname: this.hostname,
          port:     this.port,
          path:     '/containers/'+this._containerID+'/start',
          method:   'POST'
        };

        helpers.logDebug('start: path - ' + options.path);
        helpers.logDebug('start: container - ' + this._containerID);

        var req = http.request(options, function(res) {
          helpers.logDebug('start: STATUS: ' + res.statusCode);
          helpers.logDebug('start: HEADERS: ' + JSON.stringify(res.headers));
          helpers.logDebug('start: options: ' + JSON.stringify(options));

          res.setEncoding('utf8');

          res.on('data', function (chunk) {
            helpers.logInfo('start: ' + chunk);
          });

          res.on('end', function () {
            helpers.logDebug('start: res received end');
            asyncCallback(null, 'start completed');
          });

        }.bind(this));

        req.on('error', function(e) {
          helpers.logErr('start: problem with request: ' + e.message);
          process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('start: recieved end - ' + e.message);
        });

        helpers.logDebug('start: JSON data - ' + JSON.stringify(binds));
        req.write(JSON.stringify(binds));
        req.end();

        helpers.logDebug('start: Data sent...');        
    };


    // inspect
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -G http://localhost:4243/containers/c6bfd6da99d3/json
    //

    this._inspect = function(asyncCallback){

        helpers.logDebug('inspect: Start...');

        if (this._containerID === "") {
          helpers.logErr('inspect: this._containerID not set');
          process.exit();        
        }

        var options = {
          path:     '/containers/'+this._containerID+'/json',
          method:   'GET'
        };

        this._dockerRemoteAPI(options, function(chunk) {
            this._settings = JSON.parse(chunk);
            helpers.logInfo('inspect: ' + this._settings);
            helpers.logDebug('inspect: ' + this._settings.NetworkSettings.IPAddress);
        });

        helpers.logDebug('inspect: Data sent...');        
    };


    // inspect
    //-------------------------------------------------------------------------------------------------
    //
    // Get the logs of the started container (should show the current date since that's all the container does)
    // Equivalent of: curl -H "Content-Type: application/vnd.docker.raw-stream" -d '' "http://localhost:4243/containers/c6bfd6da99d3/attach?logs=1&stream=0&stdout=1"
    //

    this._logs = function(asyncCallback){

        helpers.logDebug('logs: Start...');

        if (this._containerID === "" || this._containerID === undefined) {
          helpers.logErr('logs: this._containerID not set');
          process.exit();        
        }

        var options = {
          hostname: this.hostname,
          port:     this.port,
          path:     '/containers/'+this._containerID+'/attach?logs=1&stream=0&stdout=1',
          method:   'POST',
          headers: {
            'Content-Type': 'application/vnd.docker.raw-stream',
          }
        };

        var req = http.request(options, function(res) {
          helpers.logDebug('logs: STATUS: ' + res.statusCode);
          helpers.logDebug('logs: HEADERS: ' + JSON.stringify(res.headers));
          helpers.logDebug('logs: options: ' + JSON.stringify(options));

          res.setEncoding('utf8');

          res.on('data', function (chunk) {
            console.log('logs: ' + chunk);
          });

          res.on('end', function () {
            helpers.logDebug('logs: res received end');
            if(asyncCallback !== undefined) {
              asyncCallback(null, 'logs completed');
            }
          });

        }.bind(this));

        req.on('error', function(e) {
          helpers.logErr('logs: problem with request: ' + e.message);
          process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('logs: recieved end - ' + e.message);
        });

        req.end();

        helpers.logDebug('logs: Data sent...');        
    };


    // close
    //-------------------------------------------------------------------------------------------------
    //
    // Clenaup
    //

    this._close = function(asyncCallback){

      helpers.logDebug('close: Start...');
 
      if(asyncCallback !== undefined) {
        asyncCallback(null, 'close completed');
      }

    };


    // push
    //-------------------------------------------------------------------------------------------------
    //
    // Will build an images, create a container and start the container
    //

    this.push = function(){

        helpers.logDebug('push: Start...');

        if (argv.name === "" || argv.name === undefined) {
          console.log('push requires the container name to be set - for instance --name=www.example.com!');
          process.exit();        
        }

        this._name = argv.name;

        if (argv.port === "" || argv.port === undefined) {
          console.log('push requires the container port to be set - for instance --port=8080!');
          process.exit();        
        }

        this._containerPort = argv.port;

        async.series([
            function(fn){ this._build(fn); }.bind(this),
            function(fn){ this._createContainer(fn); }.bind(this),
            function(fn){ this._start(fn); }.bind(this),
            function(fn){ this._inspect(fn); }.bind(this),
            function(fn){ this._logs(fn); }.bind(this),
            function(fn){ this._updateProxy(fn); }.bind(this),
            function(fn){ this._close(fn); }.bind(this),
        ],
        function(err, results){
          helpers.logDebug('push: results of async functions - ' + results);
          helpers.logDebug('push: errors (if any) - ' + err);
        });

        helpers.logDebug('push: End of function, async processing will continue');
    };


    // status
    //-------------------------------------------------------------------------------------------------
    //
    // Show logs and settings
    //

    // status helper function
    // curl -G http://localhost:4243/containers/json
    this._containers = function(asyncCallback) {
        helpers.logDebug('containers: Start...');

        var options = {
          path:     '/containers/json',
          method:   'GET',
        };

        this._dockerRemoteAPI(options, function(containers) {
            console.log('containers: ' + prettyjson.render(containers));
        });

        helpers.logDebug('containers: End...');  
    }

    this.status = function(){

      helpers.logDebug('status: Start...');

      if (argv.container === "" || argv.container === undefined) {
        async.series([
            function(fn){ this._proxyStatus(fn); }.bind(this),
            function(fn){ this._containers(fn); }.bind(this)
        ]);
      } else {

        this._containerID = argv.container;
        this._name        = argv.name;

        async.series([
            function(fn){ this._inspect(fn); }.bind(this),
            function(fn){ this._logs(fn); }.bind(this),
            function(fn){ 
              console.log(prettyjson.render(this._settings));
              fn(null, 'settings printed');
            }.bind(this),
            function(fn){ this._close(fn); }.bind(this),
        ],
        function(err, results){
          helpers.logDebug('status: results of async functions - ' + results);
          helpers.logDebug('status: errors (if any) - ' + err);
        });
      }
    };


    // main
    //-------------------------------------------------------------------------------------------------
    //

    switch (argv.cmd) {

        case "push":
            this.push();
            break;

        case "help":
            console.log('--cmd push --name=www.example.com --port=8080: webapp.tar in the current directory will be deployed to the cloud');
            console.log('--cmd status --container=XXX: show logs for container');
            console.log('--help: show this message');
            break;

        case "status":
            this.status();
            break;

        default:
            console.log('No such command: ' + argv.cmd);

    }

}());