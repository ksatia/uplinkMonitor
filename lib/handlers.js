/*
 * Request handlers
 */

// @TODO FIX ERROR HANDLING ON POST REQUEST

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

  console.log(firstName, lastName, phone, password, tosAgreement)
  if (firstName && lastName && phone && password && tosAgreement) { 
    // verifying that user doesn't already exist (we will read user data and if there is an error, we can proceed)

    _data.read('users', phone, function (err, data) {
      // if we have a reading error, that means the user doesn't exist and we can create the JSON file
      if (err) {
        // hash password so to use as the filename and save in 'users' directory
        // var hashedPwd = "cheese"
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
          _data.create('users', hashedPwd, data, function (err) {
            if (!err) {
              console.log('succesfully created a new user')
              callback(200)
            } else {
              console.log('Couldn\'t create new user, the following error was thrown: ' + err)
              callback(500, {'Error': 'Couldn\'t create new user, the following error was thrown: ' + err})
            }
          })

        } 
        // we need to add some more error checking here - this actually would hit if we didn't have a hashed pwd.
        // @TODO add in the callback for hashed pwd and then move to file reading error
        else {
          callback(400, { 'Error': 'that user already seems to exist' })
        }
      }
    })
  } else {
    callback (400 ,{'Error' : 'missing required fields'})
  }
}


handlers._users.get = function (data, callback) {
    // just read the file and serve it back as an object passed through the callback 
    callback(200,{'success' : 'completed the GET'})
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