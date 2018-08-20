/*
 * Request handlers
 */

// Dependencies
var _data = require('./data')
var helpers = require('./helpers')

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
    // callback code for method not allowed
    callback(405)
  }
}

// container for submethods for the users route
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
      if (err) {
        // hash password so to use as the filename and save in 'users' directory
        var hashedPwd = helpers.hash(password)

        // there's a possibility of failure in hashing our user's password (returns false)
        // validate that we successfully hashed the password before proceeding
        if (hashedPwd) {
          var userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPwd,
            'tosAgreement': true
          }

          // save data to file system and callback status code and payload
          _data.create('users', hashedPwd, data, function (err) {
            if (!err) {
              console.log('succesfully created a new user')
              callback(200)
            } else {
              console.log('Couldn\'t create new user, the following error was thrown: ' + err)
              callback(500, {'Error': 'Couldn\'t create new user, the following error was thrown: ' + err})
            }
          })

        } else {
          callback(400, { 'Error': 'that user already seems to exist' })
        }
      }
    })
  }
}


handlers._users.get = function (data, callback) {

}

handlers._users.put = function (data, callback) {

}

handlers._users.delete = function (data, callback) {

}
// write the handler for the 'ping' route
handlers.ping = function (data, callback) {
  callback(200)
}

handlers.notFound = function (data, callback) {
  callback(404)
}

// Export module
module.exports = handlers
