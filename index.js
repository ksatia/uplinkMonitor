/*
 * Entry point for API
 */

// Dependencies
const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder

// this server would respond to any kind of request from a client
const server = http.createServer(function (req, res) {
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
  var decoder = new StringDecoder('utf-8')
  var streamBuffer = ''
  // bind to event listener for requests specifically (meaning this server is now responding to client requests)
  req.on('data', function (data) {
    streamBuffer += decoder.write(data)
  })
  req.on('end', function (data) {
    streamBuffer += decoder.end()

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
})


server.listen(process.env.PORT || 8080, function () {
  console.log('server connected successfully')
})

// define handler as an empty initialized object
var handlers = {}
// write the handler for the 'sample' route
handlers.sample = function (data, callback) {
  callback(406, {'name': 'sample handler'})
}

handlers.notFound = function (data, callback) {
  callback(404)
}
// build a simple router that will call an appropriate handler to serve user the correct content
// since each path we're going to deal with is unique, we can use an object with unique keys
const router = {
  'sample': handlers.sample
}
