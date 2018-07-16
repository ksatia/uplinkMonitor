/*
 * Request handlers
 */

// Dependencies

// define handler as an empty initialized object
var handlers = {}

// write handler for 'users' route

handlers.users = function (data, callback) {
  var acceptedMethods = ['post', 'get', 'put', 'delete']
  if (acceptedMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback)
  } else {
    // callback code for method not allowed
    callback(405)
  }
}

// container for submethods for the users route
handlers._users = {}

// Users have required data - firstName, lastName, phone, password, tosAgreement
handlers._users.post = function(data, callback) {
  var firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
  var lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
  var phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
  var password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
  var tosAgreement = typeof (data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement == true ? true : false

  if (firstName && lastName && phone && password && tosAgreement) {
    // verifying that user doesn't already exist (we will read user data and if there is an error, we can proceed) 
  } else {
    callback (400, {'Error': 'Missing required fields'})
  }
}

handlers._users.get = function(data, callback) {

}

handlers._users.put = function(data, callback) {

}

handlers._users.delete = function(data, callback) {

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
