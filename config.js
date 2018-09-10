/*
 * Create and export config variables
 *
*/

// Creating a container for all possible environments
var environments = {}

environments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'staging',
  'hashingSecret' : 'thisIsASecret'
};

environments.staging.hashingSecret = 'thisIsASecret'

environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production',
  'hashingSecret' : 'thisIsAlsoASecret'
};

var passedEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : ''
// check that passed in NODE_ENV value exists in our config container object
/* we have to use bracket notation because we can't use vars with dot notation in JS otherwise we couldn't know if
  'passedEnvironment' is a property of environments or a variable called passedEnironment (which it is) */
var configEnvironment = environments.hasOwnProperty(passedEnvironment) ? environments[passedEnvironment] : environments.staging

module.exports = configEnvironment
