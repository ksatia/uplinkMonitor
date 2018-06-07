/*
 * Entry point for API
 */

// Dependencies
const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder

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
  req.on('data', function (data) {
    streamBuffer += decoder.write(data)
  })
  req.on('end', function (data) {
    streamBuffer += decoder.end()
    // send our response back to the client
    res.end('undercover crispyboi\n')
    // log out the trimmed path to verify expected output
    console.log('We got a request with this payload: ', streamBuffer)
  })
})

server.listen(process.env.PORT || 8080, function () {
  console.log('server connected successfully')
})
