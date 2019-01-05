/*
* Request handlers
*/

/* every data object passed to our handler from the index.js file has been parsed to a JS object - 
   before writing to file, we must convert back to JSON. */

// @TODO change it so that if the 'users' directory doesn't exist, it's created.
// @TODO add in tokenized authentication

// Dependencies
var _data = require('./data')
var helpers = require('./helpers')

// @TODO currently need to manually create directory otherwise we can't persist users

/* write logic so that if directory doesn't exist, it'll be created
* PRO is that user doesn't need to create it themselves, CON is that they can misspell a 
* directory when persisting and end up saving to the wrong place without any warning
*/

// define handler as an empty initialized object
var handlers = {}

// write handler for 'users' route
// callback returns a status code and a payload
handlers.users = function (data, callback) {
  var acceptedMethods = ['post', 'get', 'put', 'delete']
  var requestMethod = data.method.toLowerCase()
  if (acceptedMethods.indexOf(requestMethod) > -1) {
    handlers._users[requestMethod](data, callback)
  } else {
    callback(405)
  }
}

// container for subfunctions for the users route
/* using the underscore helps precent somebody from accidentally calling the subfunctions directly - the
   subfunctions should only be called if the request method is one of our accepted methods*/


handlers._users = {}

// Users have required data - firstName, lastName, phone, password, tosAgreement
handlers._users.post = function (data, callback) {
  var firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
  var lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
  var phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
  var password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
  var tosAgreement = typeof (data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement == true ? true : false

  if (firstName && lastName && phone && password && tosAgreement) {
    // verifying that user doesn't already exist (we will read user data and if there is an error, we can proceed)

    _data.read('users', phone, function (err, data) {
      // if we have a reading error, that means the user doesn't exist and we can create the JSON file
      if (err) {
        // hash password so we can use as the filename and save in 'users' directory
        var hashedPwd = helpers.hash(password)

        // there's a possibility of failure in hashing our user's password (returns false)
        // validate that we successfully hashed the password before proceeding and add error 
        if (hashedPwd) {
          var userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPwd,
            'tosAgreement': true
          }

          // save data to file system and callback status code (no payload since its a POST)
          _data.create('users', phone, userObject, function (err) {
            if (!err) {
              callback(200)
            } else {
              console.log('Couldn\'t create new user, the following error was thrown: ' + err)
              callback(500, { 'Error': 'Couldn\'t create new user, the following error was thrown: ' + err })
            }
          })
        } else {
          callback(500, { 'Error': 'we couldn\'t hash the password' })
        }
      } else {
        callback(400, { 'Error': 'A user with that phone number already exists' })
      }
    })
  } else {
    callback(400, { 'Error': 'missing required fields' })
  }
}

// Users - get
// Required data: phone
// @TODO only let authenticated users access their data. Don't allow access to anything else.
handlers._users.get = function (data, callback) {
  // Need to validate phone number we use for lookup
  //var phone = typeof (data.queryString.phone) == 'string' && data.queryString.phone.trim().length === 10 ? data.queryString.phone.trim() : false
  var phone = data.query.phone
  if (phone) {
    _data.read('users', phone, function (err, data) {
      if (!err && data) {
        // remove hashed password from user object so it isn't sent to requester
        delete data.hashedPassword
        callback(200, data)
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

handlers._users.put = function (data, callback) {
  // get phone number from data variable in order to pass user file (if it exists) based on phone number
  // required field is phone number (make sure user file exists)
  var phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false

  // optional fields
  var firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
  var lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
  var password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  // proceed if there is a phone number
  // if there is any optional field, read the user file, get userData, update the correct userData property value
  // if there's nothing to update, return and send an error message
  // phone field CANNOT be updated - that's what we use as a file lookup (and also how we determine if a user exists)
  
// we're calling back a status code and an error (false or a message object)
  if (phone) {
    // only read user file if there is optional data to change
    if (firstName || lastName || password) {
      // read function returns an error and an object from our local storage
      _data.read('users', phone, function (err, userObject) {
        if (!err && userObject) {
          if (firstName === userObject.firstName) {
            console.log ('that is the same first name on file')
            //callback(500, {'ruh roh' : 'enter a differen\'t first name'})
          }
          if (firstName && (firstName != userObject.firstName)) {
            userObject.firstName = firstName
          }
          if (lastName) {
            userObject.lastName = lastName
          }
          if (password) {
            userObject.hashedPassword = helpers.hash(password)
          }
          _data.update('users', phone, userObject, function (err) {
            if (!err) {
              callback(200, false)
            } else {
              callback(500, { 'Error': 'Could not update user' })
            }
          })
        } else {
          callback(400, { 'Error': 'user doesn\'t exist' })
        }
      })
    } else {
      callback(400, { 'Error': 'Missing fields to update' })
    }
  } else {
    callback(500, { "Error": " Missing required field" })
  }
}

handlers._users.delete = function (data, callback) {
   // for some reason, we needed to add entire payload instead of just the phone number??

  var phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
  if (phone) {
    // look up the user to amke sure they exist and then delete if there is data and there is no error reading
    _data.read('users', phone, function (err, data) {
      if (!err && data) {
        _data.delete('users', phone, function (err) {
          if (!err) {
            callback(200, false)
          } else {
            callback(500, { 'Error': 'failed to delete user' })
          }
        })
      } else {
        callback(400, {'Error': 'Could not find the specified user'})
      }
    })
  } else {
    callback(400, {'Error': 'Missing required phone number field'})
  }
}

// Tokens
handlers.tokens = function (data, callback) {
  var acceptedMethods = ['post', 'get', 'put', 'delete']
  var requestMethod = data.method.toLowerCase()
  if (acceptedMethods.indexOf(requestMethod) > -1) {
    handlers._tokens[requestMethod](data, callback)
  } else {
    callback(405)
  }
}

// Container for token methods
handlers._tokens = {}

// required data: phone, password
// optional data: none

// we seem to have to send all fields for some weird reason - look into this
handlers._tokens.post = function (data, callback) {
  // grab the phone and password passed by client available in the data payload
  var phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
  var password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  if (phone && password) {
    _data.read('users', phone, function (err, userData) {
      if (!err && userData) {
        var hashedPassword = helpers.hash(password)
        if (hashedPassword == userData.hashedPassword) {
          // if we hit this function interior, we have a match between the user sending requests and an authenticated user in our file system
          // create a token for them to use for subsequent requests using random name and a 1 hour expiration
          var tokenID = helpers.createRandomString(20)
          var expires = Date.now() + 1000 * 60 * 60

          var tokenObject = {
            'phone' : phone,
            'id' : tokenID,
            'expires' : expires
          }

          // store the token in our tokens directory
          _data.create ('tokens', tokenID, tokenObject, function (err) {
            if (!err) {
              callback (200, tokenObject)
            } else {
              callback (500, {'Error': 'Could not create a new token'})
            }
          })
        } else {
          callback(400, {'Error': 'Password did not match specified user credentials'})
        }
      } else {
        callback (400, {'Error': 'Couldn\'t find specified user'})
      }
    })
  } else {
    callback (400, {'Error': 'Missing required field(s)'})
  }
}

handlers._tokens.get = function (data, callback) {
  
}

handlers._tokens.put = function (data, callback) {
  
}

handlers._tokens.delete = function (data, callback) {
  
}

// write the handler for the 'ping' route
handlers.ping = function (data, callback) {
  callback(200)
}

handlers.notFound = function (data, callback) {
  callback(404)
}

// export module
module.exports = handlers