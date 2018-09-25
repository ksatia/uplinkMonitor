/*
 * Library for storing and editing data that we'll be writing to the .data folder
 *
*/

// Dependencies
var fs = require('fs')
var path = require('path')
var helpers = require('./helpers')

// Create container object to export from the module
var lib = {}

// use the current location containing this file (app/lib in this case)
// we move up one
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
      parts of our buffer to write  */
      fs.write(fd, dataToJSON, null, function (err) {
        if (!err) {
          fs.close(fd, function (err) {
            if (!err) {
              callback(false)
            } else { callback('error closing file')}
          })
        } else { callback('unable to write to file')}
      })
    } else { callback('error creating file, it may already exist')}
  })
}

lib.read = function (dir, file, callback) {
  fs.readFile(lib.directory + dir + '/' + file + '.json', 'utf8', function (err, data) {
    if (!err && data) {
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
lib.update = function (dir, file, data, callback) {
  fs.open(lib.directory + dir + '/' + file + '.json', 'r+', function (err, fd) {
    var updateData = JSON.stringify(data)
    if (!err && fd) {
      // if we pass writeFile a file descriptor, we need to close the file ourselves
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
          callback('trouble writing to file')
        }
      })
    } else {
      callback('trouble opening file - it may not exist')
    }
  })
}

lib.delete = function (dir, file, callback) {
  fs.unlink(lib.directory + dir + '/' + file + '.json', function (err) {
    if (!err) {
      callback(false)
    } else {
      callback('could not delete file')
    }
  })
}

// Export our module
module.exports = lib