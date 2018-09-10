/*
 * helper functions for our handlers.js file
 *
 */ 

// Dependencies
var crypto = require('crypto')
var config = require('./config')

// Container for our helper functions
var helpers = {}

// Define helper functions
helpers.hash = function(str) {
    console.log(config.envName)
    console.log(config.hashingSecret)
    // validate our string input
    // if (typeof(str) == 'string' && str.length > 0) {
    //     return new Buffer(
    //         crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
    //     ).toString('base64')} else {
    //     return false
    // }


    // if (typeof(str) == 'string' && str.length > 0) {
    //     // config file still returning undefined hashing secret
    //     // however, the hash is working (without using an Hmac)
    //     return crypto.createHash('sha256', config.hashingSecret).update(str).digest('hex')
    // } else {
    //     return false
    // }   
}

// parse a JSON string to object in every case without throwing an error
helpers.parseJsonToObject = function(str) {
    try {
        var obj = JSON.parse(str)
        return obj
    } catch(e) {
        return {}
    }
}

// Export the module
module.exports = helpers