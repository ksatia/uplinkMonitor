# uplinkMonitor
This is a RESTful API for users to set alerts for site status checks.

This will ultimately serve a front end for users to authenticate themselves, create accounts and track the activity status of websites. It is written in pure node.js with no external dependencies - the tokenization is also hand-rolled. 

The config.js file has been omitted because it contains an HMAC key - if cloning this, put a config.js file in the /lib directory.

The structure should be as such:
```
// Create and export config variables

// Creating a container for all possible environments
var environments = {}

environments.staging = {
  'httpPort': port of choice,
  'httpsPort': port of choice,
  'envName': 'staging',
  'hashingSecret': 'include your own HMAC secret key'
};

environments.staging.hashingSecret = 'thisIsASecret'

environments.production = {
  'httpPort': port of choice,
  'httpsPort': port of choice,
  'envName': 'production',
  'hashingSecret': 'include your own HMAC secret key'
};

var passedEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : ''

var configEnvironment = environments.hasOwnProperty(passedEnvironment) ? environments[passedEnvironment] : environments.staging

module.exports = configEnvironment
```
