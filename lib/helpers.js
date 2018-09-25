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
    if (typeof(str) == 'string' && str.length > 0) {
        let hashedPhone = crypto.createHash('sha256', config.hashingSecret).update(str).digest('hex')
        return(hashedPhone)
    } else {
        return false
    }   
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