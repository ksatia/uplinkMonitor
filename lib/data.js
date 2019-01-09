/*
 * Library for storing and editing data that we'll be writing to the .data folder
 *
*/

// @TODO remove most comments unless necessary

// Dependencies
var fs = require('fs')
var path = require('path')
var helpers = require('./helpers')

// Create container object to export from the module
var lib = {}


// use the current location containing this file (app/lib in this case)
// we move up onedfd
lib.directory = path.join(__dirname, '/../.data/')

// write a function to create a file in our .data directory for storing data
/* we have the path to the directory already - we need to open it, create a file using the filename passed,
   write the data to it and then signal that we were successful
*/
lib.create = function (dir, file, data, callback) {
  // open the file for writing - we want to create a file within a directory if it doesn't exist
  // we want to have a subset of directories within our .data folder (users, likes, etc) and files should terminate with .json
  // we call open here instead of just writing immediately because we want to pass flags and check conditionals
  fs.open(lib.directory + dir + '/' + file + '.json', 'wx', function (err, fd) {
    if (!err && fd) {
      var dataToJSON = JSON.stringify(data)
      // write to file and close it
      /* fs.write is lower level function - we can control where we begin writing and can pick certain
      parts of our buffer to write (if a buffer is passed - we can also pass a string). If we pass a buffer, 
      generally also need to pass an offset and length
      */
      fs.write(fd, dataToJSON, null, function (err) {
        if (!err) {
          fs.close(fd, function (err) {
            if (!err) {
              callback(false)
            } else { callback('error closing file') }
          })
        } else { callback('unable to write to file') }
      })
    } else { callback('error creating file, it may already exist') }
  })
}

lib.read = function (dir, file, callback) {
  fs.readFile(lib.directory + dir + '/' + file + '.json', 'utf8', function (err, data) {
    if (!err && data) {
      // we know we're storing raw JSON in our users directory, so if we're reading it, we should parse it to a JS object  
      var parsedData = helpers.parseJsonToObject(data)
      callback(false, parsedData)
    } else {
      callback(err, data)
    }
  })
}

// to update file content, we need to take same params as create
// we open the file, get a file descriptor, stringify our data, truncate the file and then write to it (fs.write which is lower level)
// if we used fs.writeFile, we wouldn't need to call fs.open (writeFile automatically opens a file but doesn't give us a fileDescriptor)
// if we want to truncate the file, we need to pass in a fileDescriptor
// fs.open will also allow us to check for an error in opening the files

// we're updating our files within the /users directory here
// the client is sending a body as JSON which we convert to a string,  
lib.update = function (dir, file, data, callback) {
  fs.open(lib.directory + dir + '/' + file + '.json', 'r+', function (err, fd) {
    if (!err && fd) {
      // convert JS object to string that we'll then write to our file. 
      var updateData = JSON.stringify(data)
      // we need to truncate the file before writing over it
      fs.ftruncate(fd, 0, function (err) {
        if (!err) {
          fs.writeFile(fd, updateData, function (err) {
            if (!err) {
              fs.close(fd, function (err) {
                if (!err) {
                  callback(false)
                } else {
                  callback('error closing file')
                }
              })
            } else {
              callback(false, 'trouble writing to file')
            }
          })
        } else {
          callback(false, 'could not truncate file')
        }
      })
    } else {
      callback('could not open file')
    }
  })
}

// unlink the file and detatch from reference 
lib.delete = function (dir, file, callback) {
  fs.unlink(lib.directory + dir + '/' + file + '.json', function (err) {
    if (!err) {
      callback(false)
    } else {
      // expecting a status code and payload, pass false for error
      callback('could not delete file')
    }
  })
}

// Export our module
module.exports = lib