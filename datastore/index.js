const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
const fsPromised = Promise.promisifyAll(fs);

var items = {};
// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {

  counter.getNextUniqueId((err, id) => {
    if (err) {
      console.log('error in create');
      callback(err);
    }
    var filePath = path.join(exports.dataDir, `${id}.txt`);
    fs.writeFile(filePath, text, (err) => {
      if (err) {
        console.log('error in file creation');
        callback(err);
      } else {
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  return fsPromised.readdirAsync(exports.dataDir)
    .then((files) => {
      var data = files.map((file) => {
        var id = file.split('.')[0];
        var filePath = path.join(exports.dataDir, file);
        return fsPromised.readFileAsync(filePath)
          .then((fileData) => {
            return ({ id: id, text: fileData.toString() });
          });
      });
      Promise.all(data).then((data) => {
        callback(null, data);
      })
        .catch((err) => {
          callback(err);
        });
    });
};

exports.readOne = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      console.log(`No item with id: ${id}`);
      callback(err);
    } else {
      console.log({ id: id, text: fileData.toString() });
      callback(null, { id: id, text: fileData.toString() });
    }
  });
};

exports.update = (id, text, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      console.log(`No item with id: ${id}`);
      callback(err);
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          console.log(`error writing with id: ${id}`);
          callback(err);
        } else {
          callback(null, { id: id, text: text });
        }
      });
    }
  });

  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
};

exports.delete = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(filePath, (err, fileData) => {
    if (err) {
      console.log(`No item with id: ${id}`);
      callback(err);
    } else {
      console.log(`${id}.txt was deleted`);
      callback();
    }
  });

  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  // callback();
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
