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

    nconf.use('file', { file: __dirname + '/jacc_config.json' });
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
        _use_export    = false,
        _settings      = {};


    // helpers
    //======================================================================

    this._isset2 = function(a, message){
      return (a !== undefined && a !== "" && a !== null && a !== [] && a !== {});
    };

    this._isset = function(a, message, dontexit){
      helpers.logDebug('_isset: checking - ' + a );
      if (!this._isset2(a)) {
        console.log(message);
        if(dontexit !== undefined && dontexit) {
          return;
        } else {
          process.exit();
        }        
      }
    };


    // hipache functions
    //======================================================================


    // _proxyGetContainerIDForName
    //-------------------------------------------------------------------------------------------------
    //
    // Get the this._containerID based on this._name
    //

    this._proxyGetContainerIDForName = function(asyncCallback){

      helpers.logDebug('_proxyGetContainerIDForName: Start...'+this._name);

      this._isset(this._name, '_proxyGetContainerIDForName: this._name not set');

      var redis_client = redis.createClient();

      redis_client.on("connect", function () {

          helpers.logDebug('_proxyGetContainerIDForName: redis connected - looking for '+this._name);

          redis_client.lrange("frontend:"+this._name, 0, 0, function(err, res) {
            helpers.logDebug('_proxyGetContainerIDForName: hipache entry - '+"frontend:"+this._name+'='+res);
            this._containerID = res;

            redis_client.quit();

            helpers.logDebug('_proxyGetContainerIDForName: end');
            if(asyncCallback !== undefined) {
              asyncCallback(null, '_proxyGetContainerIDForName completed');
            }
          }.bind(this));
      }.bind(this));

      // redis error management
      redis_client.on("error", function (err) {
          helpers.logErr("Redis error: " + err);
      });

    };


    // updateProxy
    //-------------------------------------------------------------------------------------------------
    //
    // Add both frontend and backend to proxy
    //

    this._updateProxy = function(asyncCallback){

      helpers.logDebug('updateProxy: Start...');

      var redis_client = redis.createClient();

      redis_client.on("connect", function () {
          redis_client.rpush("frontend:"+this._name, this._containerID, 
            function(err, res) {
              if(err) {
                helpers.logErr('ERROR! updateProxy failed when writing to Redis');
              }
              helpers.logDebug('_updateProxy: wrote frontend - '+res);
            });

          var backend = "http://"+this._settings.NetworkSettings.IPAddress+":"+this._containerPort;

          redis_client.rpush("frontend:"+this._name, 
                             backend, 
                              function(err, res) {
                                if(err) {
                                  helpers.logErr('ERROR! updateProxy failed when writing to Redis');
                                }
                                helpers.logDebug('_updateProxy: wrote frontend - '+res);

                              });

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
    // NOTE: Currently only fetching status for the first backend

    this._proxyStatus = function(asyncCallback){

      helpers.logDebug('_proxyStatus: Start...');

      var redis_client = redis.createClient();

      redis_client.on("connect", function () {

          helpers.logDebug('_proxyStatus: redis connected...');

          redis_client.keys("frontend*", function(err, keys) {
            helpers.logDebug('_proxyStatus: keys - '+keys);

            keys.forEach(function (key,i) {
                redis_client.lrange(key, 0,-1, function(err, res) {

                  helpers.logDebug('_proxyStatus: hipache entry:'+key+' res:'+res);

                  // Fetch the settings for the container
                  this._containerID = res[0];
                  async.series([
                    function(fn) { this._inspect(fn); }.bind(this),
                    function(fn) {
                      helpers.logDebug(key+' - backend:'+prettyjson.render(this._settings));
 
                      // Print some info
                      console.log(key+' - backend:'+res+
                                  ' IP:'+((this._settings !== undefined) ? 
                                    this._settings.NetworkSettings.IPAddress : 
                                    'not set!') );

                      fn(null, '_proxyStatus partial');
                    }.bind(this)
                  ]);
                });
            });

            helpers.logDebug('_proxyStatus: close redis connection...');
            redis_client.quit();

            helpers.logDebug('_proxyStatus: end');
            if(asyncCallback !== undefined) {
              asyncCallback(null, '_proxyStatus completed');
            }

          });

      }.bind(this));

      // redis error management
      redis_client.on("error", function (err) {
          helpers.logErr("Redis error: " + err);
      });

    };


    // Docker functions
    //======================================================================

    this._dockerRemoteAPI = function(options, funcResData, funcResEnd, funcReq, asyncCallback){

        helpers.logDebug('_dockerRemoteAPI: Start...');

        options.hostname = this.hostname;
        options.port     = this.port;

        helpers.logDebug('_dockerRemoteAPI: options: ' + JSON.stringify(options));

        var req = http.request(options, function(res) {
          helpers.logDebug('_dockerRemoteAPI: STATUS: ' + res.statusCode);
          helpers.logDebug('_dockerRemoteAPI: HEADERS: ' + JSON.stringify(res.headers));

          res.setEncoding('utf8');

          res.on('data', funcResData.bind(this));

          if(funcResEnd !== null) {
            res.on('end', funcResEnd.bind(this));
          } else {
            res.on('end', function () {
              helpers.logDebug('_dockerRemoteAPI: res received end');
              if(asyncCallback !== undefined) {
                asyncCallback(null, '_dockerRemoteAPI:');
              }
            }.bind(this));
          }
        }.bind(this));

        req.on('error', function(e) {
          helpers.logErr('_dockerRemoteAPI: problem with request: ' + e.message);
          process.exit();
        });

        req.on('end', function(e) {
            helpers.logDebug('_dockerRemoteAPI: recieved end - ' + e.message);
        });

        if(funcReq !== null) {
          funcReq(req);
        } else {
          req.end();
        }

        helpers.logDebug('_dockerRemoteAPI: Data sent...');        
    };


    // import
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -H "Content-type: application/tar" --data-binary @webapp.tar http://localhost:4243/build
    //

    this._import = function(asyncCallback){

        helpers.logDebug('import: Start...');

        var options = {
          path: '/images/create?fromSrc=-',
          method: 'POST',
          headers: {
            'Content-Type': 'application/tar',
          }
        };

        this._dockerRemoteAPI(options, 
          function(chunk) {
            helpers.logDebug('import: ' + chunk);

            this._imageID = JSON.parse(chunk).status;
          }.bind(this),
          function() {
            this._isset(this._imageID, 'Import failed! No image was created.');
            helpers.logDebug('import: res received end - image ID: ' + this._imageID);
            if(asyncCallback !== undefined) {
              asyncCallback(null, 'image:'+this._imageID);
            }      
          }.bind(this),
          function(req) {
            // write data to the http.ClientRequest (which is a stream) returned by http.request() 
            var fs = require('fs');
            var stream = fs.createReadStream('webapp.export.tar');

            // Close the request when the stream is closed
            stream.on('end', function() {
              helpers.logDebug('import: stream received end');
              req.end();
            }.bind(this));

            // send the data
            stream.pipe(req);
          }.bind(this),
          asyncCallback);

        helpers.logDebug('import: Data sent...');
    };


    // build
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -H "Content-type: application/tar" --data-binary @webapp.tar http://localhost:4243/build
    //

    this._build = function(asyncCallback){

        helpers.logDebug('build: Start...');

        var options = {
          path: '/build?nocache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/tar',
          }
        };

        this._dockerRemoteAPI(options, 
          function(chunk) {
            helpers.logDebug('build: ' + chunk);

            // The last row looks like this 'Successfully built 3df239699c83'
            if (chunk.slice(0,18) === 'Successfully built') {
                this._imageID = chunk.slice(19,31);
                helpers.logDebug('build: Build seams to be complete - image ID: ' + this._imageID );
            }
          }.bind(this),
          function() {
            this._isset(this._imageID, 'Build failed! No image was created.');
            helpers.logDebug('build: res received end - image ID: ' + this._imageID);
            if(asyncCallback !== undefined) {
              asyncCallback(null, 'image:'+this._imageID);
            }      
          }.bind(this),
          function(req) {
            // write data to the http.ClientRequest (which is a stream) returned by http.request() 
            var fs = require('fs');
            var stream = fs.createReadStream('webapp.tar');

            // Close the request when the stream is closed
            stream.on('end', function() {
              helpers.logDebug('build: stream received end');
              req.end();
            }.bind(this));

            // send the data
            stream.pipe(req);
          }.bind(this),
          asyncCallback);

        helpers.logDebug('build: Data sent...');
    };


    // createContainer
    //-------------------------------------------------------------------------------------------------
    //
    // create a container with the new image
    // curl -H "Content-Type: application/json" -d @create.json http://localhost:4243/containers/create
    // {"Id":"c6bfd6da99d3"}

    this._createContainer = function(asyncCallback){

        this._isset(this._imageID, 'createContainer: this._imageID not set');

        if (this._use_export !== undefined && this._use_export.length === 0) {
          console.log('create container requires a command - for instance --use_export="node /src/index.js"');
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

        if (this._use_export !== undefined && this._use_export.length > 0) {
          container.cmd = [this._use_export];
        }

        var options = {
          path: '/containers/create',
          method: 'POST'
        };

        helpers.logDebug('createContainer: Start...');

        this._dockerRemoteAPI(options, 
          function(chunk) {
              helpers.logInfo('createContainer: ' + chunk);

              // The result should look like this '{"Id":"c6bfd6da99d3"}'
              try {
                this._containerID = JSON.parse(chunk).Id;            
                helpers.logDebug('createContainer: container created with ID: ' + this._containerID);
              } catch (e) {
                  console.log('Create container failed: '+chunk);
                  process.exit();          
              }
          }.bind(this),
          null,
          function(req) {
              helpers.logDebug('createContainer: JSON data - ' + JSON.stringify(container));
              req.write(JSON.stringify(container));
              req.end();
          }.bind(this),
          asyncCallback);

        helpers.logDebug('createContainer: Data sent...');
   };


    // start
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -H "Content-Type: application/json" -d @start.json http://localhost:4243/containers/c6bfd6da99d3/start
    //

    this._start = function(asyncCallback){

        helpers.logDebug('start: Start...');

        this._isset(this._containerID, 'start: this._containerID not set');

        var binds = {
            "Binds":["/tmp:/tmp"]
        };

        var options = {
          path:     '/containers/'+this._containerID+'/start',
          method:   'POST'
        };

        helpers.logDebug('start: container - ' + this._containerID);

        this._dockerRemoteAPI(options, 
          function(chunk) {
            helpers.logDebug('start: ' + chunk);
          }.bind(this),
          null,
          function(req) {
            helpers.logDebug('start: JSON data - ' + JSON.stringify(binds));
            req.write(JSON.stringify(binds));
            req.end();
          }.bind(this),
          asyncCallback);

        helpers.logDebug('start: Data sent...');        
    };


    // delete
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -d '' http://localhost:4243/containers/c6bfd6da99d3/stop?t=10
    //

    this._delete = function(asyncCallback){

        helpers.logDebug('delete: Start...');

        async.series([
          // Get the container ID for the name
          function(fn){ this._proxyGetContainerIDForName(fn); }.bind(this),

          // Fetch the container settings
          function(fn) {
            helpers.logDebug('delete: inspect container with container ID '+this._containerID);
            if (this._isset(this._containerID, "Container missing, can't inspect", true)) {
              this._inspect(fn);
            }
          }.bind(this),

          // stop the container
          function(fn) {
            helpers.logDebug('delete: stop container with container ID '+this._containerID);
            if (this._isset(this._containerID, "Container missing can't delete", true)) {

              var options = {
                path:     '/containers/'+this._containerID+'/stop?t=10',
                method:   'POST'
              };

              helpers.logDebug('delete: stop container - ' + this._containerID);

              this._dockerRemoteAPI(options, 
                function(chunk) {
                  helpers.logDebug('delete: ' + chunk);
                }.bind(this),
                null,
                null,
                fn);
            }
          }.bind(this),

          // Delete the container
          function(fn) {
            helpers.logDebug('delete: remove container with container ID '+this._containerID);
            if (this._isset2(this._containerID)) {

              var options = {
                path:     '/containers/'+this._containerID+'?v=1',
                method:   'DELETE'
              };

              helpers.logDebug('delete: remove container - ' + this._containerID);

              this._dockerRemoteAPI(options, 
                function(chunk) {
                  helpers.logDebug('delete: ' + chunk);
                }.bind(this),
                null,
                null,
                fn);
            }
          }.bind(this),

          // Delete the image
          function(fn) {
            helpers.logDebug('delete: remove image with image ID '+this._imageID);
            if (this._isset(this._imageID, "Image missing,cant remove",true)) {

              var options = {
                path:     '/images/'+this._imageID,
                method:   'DELETE'
              };

              helpers.logDebug('delete: remove image - ' + this._imageID);

              this._dockerRemoteAPI(options, 
                function(chunk) {
                  helpers.logDebug('delete: ' + chunk);
                }.bind(this),
                null,
                null,
                fn);
            }
          }.bind(this)
          ]);


        helpers.logDebug('delete: Data sent...');        
    };


    // inspect
    //-------------------------------------------------------------------------------------------------
    //
    // Equivalent of: curl -G http://localhost:4243/containers/c6bfd6da99d3/json
    //

    this._inspect = function(asyncCallback){

        this._isset(this._containerID, 'inspect: this._containerID not set', true);

        var options = {
          path:     '/containers/'+this._containerID+'/json',
          method:   'GET'
        };

        this._dockerRemoteAPI(options, function(chunk) {
            helpers.logDebug('inspect: '+chunk);
            try {
              this._settings = JSON.parse(chunk);
              this._imageID  = this._settings;
            } catch (e) {
              helpers.logErr('inspect: error fetching data for - ' + this._containerID);
            }
        }.bind(this),
        null,
        null,
        asyncCallback);
    };


    // logs
    //-------------------------------------------------------------------------------------------------
    //
    // Get the logs of the started container (should show the current date since that's all the container does)
    // Equivalent of: curl -H "Content-Type: application/vnd.docker.raw-stream" -d '' "http://localhost:4243/containers/c6bfd6da99d3/attach?logs=1&stream=0&stdout=1"
    //

    this._logs = function(asyncCallback){
        this._isset(this._containerID, 'logs: this._containerID not set');

        var options = {
          path:     '/containers/'+this._containerID+'/attach?logs=1&stream=0&stdout=1',
          method:   'POST',
          headers: {
            'Content-Type': 'application/vnd.docker.raw-stream',
          }
        };

        this._dockerRemoteAPI(options, function(chunk) {
            console.log('logs: ' + chunk);
          },
          null,
          null,
          asyncCallback);
    };


    // push
    //-------------------------------------------------------------------------------------------------
    //
    // Will build an images, create a container and start the container
    //

    this.push = function(){

        helpers.logDebug('push: Start...');

        this._isset(argv.name, 'push requires the container name to be set - for instance --name=www.example.com!');
        this._isset(argv.port, 'push requires the container port to be set - for instance --port=8080!');

        this._name          = argv.name;
        this._containerPort = argv.port;
        this._use_export    = argv.use_export;

        async.series([
            // Delete the container and image if it already exists
            function(fn){ this._delete(fn); }.bind(this),

            // Create new image and container
            function(fn){
              if(this._use_export === undefined) {
                this._build(fn); 
              } else {
                this._import(fn);
              }
            }.bind(this),
            function(fn){ this._createContainer(fn); }.bind(this),
            function(fn){ this._start(fn); }.bind(this),
            function(fn){ this._inspect(fn); }.bind(this),
            function(fn){ this._updateProxy(fn); }.bind(this),
            function(fn){ this._logs(fn); }.bind(this)
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

        this._dockerRemoteAPI(options, function(chunk) {
            var containers = JSON.parse(chunk);

            containers.forEach(function(container) {
              this._containerID = container.Id;
              this._inspect(asyncCallback);
              //this._settings.NetworkSettings.IPAddress
            });

            console.log('containers: ' + prettyjson.render(containers));

          },
          null,
          null,
          asyncCallback);

        helpers.logDebug('containers: End...');  
    };

    this.status = function(){

      helpers.logDebug('status: Start...');

      // List all containers
      if (argv.name === "" || argv.name === undefined) {
        async.series([
            function(fn){ this._proxyStatus(fn); }.bind(this),
            /*function(fn){ this._containers(fn); }.bind(this)*/
        ],
        function(err, results){
          helpers.logDebug('status: results of async functions - ' + results);
          helpers.logDebug('status: errors (if any) - ' + err);
        });
      } 

      // Show status for a specific container
      else {

        this._containerID = null;
        this._name        = argv.name;

        async.series([
            function(fn){ this._proxyGetContainerIDForName(fn); }.bind(this),
            function(fn){ 
              this._isset(this._containerID, 'There is no app with the name: '+this._name);
              this._inspect(fn); 
            }.bind(this),
            function(fn){ this._logs(fn); }.bind(this),
            function(fn){ 
              console.log(prettyjson.render(this._settings));
              fn(null, 'settings printed');
            }.bind(this)
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

    this._isset(argv.cmd, 'jacc requires a command, jacc.js --cmd push|status|help!');

    switch (argv.cmd) {

        case "push":
            this.push();
            break;

        case "help":
            console.log('--cmd push --name=www.example.com --port=8080: webapp.tar in the current directory will be deployed to the cloud');
            console.log('--cmd status --name=XXX: show logs for container');
            console.log('--help: show this message');
            break;

        case "status":
            this.status();
            break;

        default:
            console.log('No such command: ' + argv.cmd);

    }


}());