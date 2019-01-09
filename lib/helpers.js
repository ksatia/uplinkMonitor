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
helpers.hash = function (str) {
    if (typeof (str) == 'string' && str.length > 0) {
        let hashedPhone = crypto.createHash('sha256', config.hashingSecret).update(str).digest('hex')
        return (hashedPhone)
    } else {
        return false
    }
}

helpers.parseJsonToObject = function (str) {
    // parse a JSON string to object in every case without throwing an error
    try {
        var obj = JSON.parse(str)
        return obj
    } catch (e) {
        return {}
    }
}

helpers.createRandomString = function (strLength) {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false
    if (strLength) {
        var possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        var str = ''
        for (var i = 0; i <= strLength; i++) {
            var randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
            str += randomChar
        }
        return str
    } else {
        return false
    }
}

helpers.dataValidation = function (data, dataField, queryOrPayload) {
    // data is our entire data object - we're looking at either the query or payload    
    if (queryOrPayload === "query") {
        if (data.query.has(dataField)) {
            if (dataField === 'phone') {
                var phone = data.query.get('phone')
                return (typeof (phone === 'string' && phone.trim().length === 10) ? phone.trim() : false)
            }
        }
    }

    if (queryOrPayload === 'payload') {
        if (data.payload[dataField]) {
            switch (dataField) {
                case 'firstName':
                case 'lastName':
                case 'password':
                    return ((typeof data.payload[dataField] === 'string' && data.payload[dataField].trim().length > 0) ? data.payload[dataField].trim() : false)
                    break
                case 'phone':
                    return ((typeof data.payload[dataField] === 'string' && data.payload[dataField].trim().length === 10) ? data.payload[dataField].trim() : false)
                    break
                case "tosAgreement":
                    return ((typeof data.payload[dataField] === 'boolean' && data.payload[dataField] == true) ? true : false)
                    break
            }
        }
    }

}

// Export the module
module.exports = helpers