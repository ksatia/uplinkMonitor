/*
 * Create and export config variables
*/

// Creating a container for all possible environments
var environments = {}

environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'thisIsASecret'
};

environments.staging.hashingSecret = 'thisIsASecret'

environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'thisIsAlsoASecret'
};

var passedEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// environments.passedEnvironment could mean there is a passedEnvironment property name on the object (there is not)
// enviornments[passedEnvironment] would check the value of passedEnvironment as a standalone variable before trying to access
// ^ use bracket notation here
// check that passed in NODE_ENV value exists in our config container object
var configEnvironment = environments.hasOwnProperty(passedEnvironment) ? environments[passedEnvironment] : environments.staging

module.exports = configEnvironment
