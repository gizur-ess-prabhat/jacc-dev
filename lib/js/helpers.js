/*jshint browser:true, devel:true, evil:true*/
(function(exports) {

// helpers.js
//------------------------------
//
// 2012-10-12, Jonas Colmsjö
//
// Copyright 2012 Gizur AB 
//
// Examples for the Gizur REST API
//
// dependencies: npm install jsdom xmlhttprequest jQuery optimist
// local dependencies: sha256.js, BigInt.js
// browser dependencies: jQuery
//
// Using Google JavaScript Style Guide - http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
//
// The code is commented in 'docco style' - http://jashkenas.github.com/docco/ 
//
//
// Use in browser:
//---------------
// <script type="text/javascript" src="https://raw.github.com/colmsjo/helpersjs/master/helpers-old.js"></script>
// ...
// var h = helpers.create();
// h.test("Testing to use the plates library.", function(){
// ...
//
//------------------------------

    "use strict";

    exports.create = function() {

        return {

            // Unit test functions
            //------------------
            // Based on John Resig's Ninja book

            results : [],
     
            assert : function assert( value, desc ) {
                var li = document.createElement("li");
                li.className = value ? "pass" : "fail";
                li.appendChild( document.createTextNode( desc ) );
                this.results.appendChild( li );
                if ( !value ) {
                    li.parentNode.parentNode.className = "fail";
                }
                return li;
            },

            test : function test(name, fn) {
                this.results = document.getElementById("results");
                this.results = this.assert( true, name ).appendChild(
                    document.createElement("ul") );
                fn();
            },

            // Logging
            //------------------
            
            logging : {
                emerg:   0,
                alert:   1,
                crit:    2,
                err:     3,
                warning: 4,
                notice:  5,
                info:    6,
                debug:   7
            },

            logging_threshold : 4,

            logEmerg : function(){
                if(this.logging.emerg <= this.logging_threshold ) {
                    console.log(arguments);
                }
            },

            logAlert : function(){
                if(this.logging.alert <= this.logging_threshold ) {
                    console.log(arguments);
                }
            },

            logCrit : function(){
                if(this.logging.crit <= this.logging_threshold ) {
                    console.log(arguments);
                }
            },

            logErr : function(){
                if(this.logging.err <= this.logging_threshold ) {
                    console.log(arguments);
                }
            },

            logWarning : function(){
                if(this.logging.warning <= this.logging_threshold ) {
                    console.log(arguments);
                }
            },

            logNotice : function(){
                if(this.logging.notice <= this.logging_threshold ) {
                    console.log(arguments);
                }
            },

            logInfo : function(){
                if(this.logging.info <= this.logging_threshold ) {
                    console.log(arguments);
                }
            },

            logDebug : function(){
                if(this.logging.debug <= this.logging_threshold ) {
                    console.log.apply(console, arguments);
                }
            },

            // A simple logging statement that works in all browsers.
            log : function log() {
                try {
                    console.log.apply( console, arguments );
                } catch(e) {
                    try {
                        opera.postError.apply( opera, arguments );
                    } catch(e){
                        alert( Array.prototype.join.call( arguments, " " ) );
                    }
                }
            },


            // Templating
            //------------------

            // Simple JavaScript Templating
            // John Resig - http://ejohn.org/ - MIT Licensed 
            cache : {},
            tmpl : function tmpl(str, data) {
            
                // Figure out if we're getting a template, or if we need to 
                // load the template - and be sure to cache the result. 
                var fn = !/\W/.test(str) ?
                    this.cache[str] = this.cache[str] || tmpl(document.getElementById(str).innerHTML) :
                
                // Generate a reusable function that will serve as a template 
                // generator (and which will be cached).
                new Function(
                    "obj","var p=[],print=function(){p.push.apply(p,arguments);};" + 
                    
                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +
                    
                    // Convert the template into pure JavaScript
                    str
                        .replace(/[\r\t\n]/g, " ")
                        .split("<%").join("\t")
                        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                        .replace(/\t=(.*?)%>/g, "',$1,'")
                        .split("\t").join("');")
                        .split("%>").join("p.push('")
                        .split("\r").join("\\'") + 
                        "');}" + 
                        "return p.join('');"
                    );
                
                // Provide some basic currying to the user
                return data ? fn( data ) : fn; 
            },

            // ISODateString
            //-------------------------------------------------------------------------------------------------
            //

            ISODateString : function(d) {

                function pad(n){
                    return n < 10 ? '0' + n : n;
                }

                return d.getUTCFullYear()  + '-' + 
                    pad(d.getUTCMonth()+1) + '-' + 
                    pad(d.getUTCDate())    + 'T' +
                    pad(d.getUTCHours())   + ':' + 
                    pad(d.getUTCMinutes()) + ':' +
            //          pad(d.getUTCSeconds())+'Z'
                    pad(d.getUTCSeconds()) +
                    (d.getTimezoneOffset() < 0 ? '+' : '-') +
                    pad(Math.abs(Math.floor(d.getTimezoneOffset() / 60 ))) + ':' +
                    pad(d.getTimezoneOffset() % 60) ; 
            },

            // Gizur API Helper Functions
            //==========================


            // signString
            //-------------------------------------------------------------------------------------------------
            //

            signString : function (stringToSign, secret) {

                // Generate the hash
                var shaObj = new this.jsSHA(stringToSign, "ASCII");
                var hmac   = shaObj.getHMAC(secret, "TEXT", "SHA-256", "B64");

                // Encode in bas64 using jQuery plugin
                //var encoded = $.base64.encode( hmac );

                // usefull for debuggning
                this.logDebug('sign: stringToSign - ' + stringToSign + ' - hash - ' + hmac );

                return hmac;
            },

            // sign
            //-------------------------------------------------------------------------------------------------
            //

            sign : function (model, method, key, secret, delta) {

                // Get Current UNIX time
                var unixtimestamp = new Date().getTime();

                // Check if delta is defined
                if (delta === undefined) { 
                    delta = 0; 
                }

                // The ISO-8601 date 
                var timestamp = this.ISODateString(new Date(unixtimestamp + (delta * 1000)) );

                // I'm using a 10 digit random number as salt
                var salt     =  Math.floor( Math.random() * 1000000000 );

                // Build the string to sign
                var signatureArray =[ 
                        'Verb' +       method,
                        'Model' +      model,
                        'Version' +    '0.1',
                        'Timestamp' +  timestamp,
                        'KeyID' +      key,
                        'UniqueSalt' + salt 
                    ];

                // Sort the array
                signatureArray.sort();

                // Create a string out of array
                var stringToSign = signatureArray.join('');

                var encoded = this.signString(stringToSign, secret);

                // return a object with timestamp, salt and the signture
                return { timestamp: timestamp, salt: salt, base64: encoded };
            },

            generateApiKeyAndSecret : function(bigint) {
                return { apiKey    : bigint.bigInt2str(bigint.randBigInt(64,0), 32), 
                         apiSecret : bigint.bigInt2str(bigint.randBigInt(128,0), 58) };
            }

        };
    };

}(typeof exports === 'undefined' ? this['helpers']={} : exports));