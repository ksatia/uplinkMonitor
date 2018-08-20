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
    // validate our string input
    if (typeof(str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashKey).update(str).digest('hex')
        return hash
    } else {
        return false
    }
}

// Export the module
module.exports = helpers