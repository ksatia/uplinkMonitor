/*
 * Entry point for API
 */

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
var config = require('./config')
var fs = require('fs')
var _data = require('./lib/data')
var handlers = require('./lib/handlers')

// this server would respond to any kind of request from a client
const httpServer = http.createServer(function (req, res) {
  serverLogic(req, res)
})

// listen using the configuration port passed from the command line
httpServer.listen(config.httpPort || 5000, function () {
  console.log('HTTP server connected successfully at port ' + config.httpPort + ' using the ' + config.envName + ' environment')
})

// we need to create keys that are required for starting an HTTPS server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}

const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  serverLogic(req, res)
})

httpsServer.listen(config.httpsPort, function () {
  console.log('HTTPS server connected successfully at port ' + config.httpsPort + ' using the ' + config.envName + ' environment')
})

var serverLogic = function (req, res) {
  // parse URL using request object
  var parsedURL = url.parse(req.url, true)

  // get the pathName so that we can trim it
  var urlPathName = parsedURL.pathname

  // trim the value of the pathName object key
  var trimmedPathName = urlPathName.replace(/^\/+|\/+$/g, '')

  // get the query string
  var queryString = parsedURL.query

  // get the HTTP method in the request
  var method = req.method.toUpperCase()

  // parse the request header sent from client
  var header = req.headers

  // get payload from request object (if there is one)
  var decoder = new StringDecoder('utf8')
  var streamBuffer = ''
  // bind to event listener for requests specifically (meaning this server is now responding to client requests)
  req.on('data', function (data) {
    streamBuffer += decoder.write(data)
  })
  req.on('end', function (data) {
    streamBuffer += decoder.end(data)

    // implement router logic
    var handler = router.hasOwnProperty(trimmedPathName) ? router[trimmedPathName] : handlers.notFound

    // construct object to pass as 'data' parameter for callback
    var dataObj = {
      'trimmedPath': trimmedPathName,
      'query': queryString,
      'method': method,
      'header': header,
      'payload': streamBuffer
    }

    // route the request to the specified handler
    // value of the handler variable is a function that takes a data object and a callback
    // we're actually invoking the handler here and passing in our data, status code and callback
    handler(dataObj, function (statusCode, payload) {
      // we can't know the statusCode ahead of time so set a default
      statusCode = typeof (statusCode) === 'number' ? statusCode : 200
      payload = typeof (payload) === 'object' ? payload : {}
      var stringifiedPayload = JSON.stringify(payload)

      // return response to client
      res.setHeader('content-type', 'application/json')
      res.writeHead(statusCode)
      res.end(stringifiedPayload)

      // log out the trimmed path to verify expected output
      // the statusCode and stringifiedPayload are getting passed in from the handler callback defined below
      console.log('Returning this response: ', statusCode, stringifiedPayload)
    })
  })
}

// build a simple router that will call an appropriate handler to serve user the correct content
// since each path we're going to deal with is unique, we can use an object with unique keys
const router = {
  'ping': handlers.ping,
  'users': handlers.users
}
