/*
 * Create and export config variables
 *
*/

// Creating a container for all possible environments
var environments = {}

environments.staging = {
  'port': 8080,
  'envName': 'staging'
}

environments.production = {
  'port': 3000,
  'endName': 'production'
}

var passedEnvironment = typeof (process.argv.NODE_ENV) === 'string' ? process.argv.NODE_ENV.toLocaleLowerCase() : ''

// check that passed in NODE_ENV value exists in our config container object
var configEnvironment = environments.hasOwnProperty(passedEnvironment) ? environments.passedEnvironment : environments.staging
