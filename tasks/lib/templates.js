var fs = require('fs');
var path = require('path');

var templates = {};

var templatesDir = path.join(__dirname, 'templates');
var fileNames = fs.readdirSync(templatesDir);
fileNames.forEach(function(fileName) {
  var name = fileName.substr(0, fileName.length - 5);
  templates[name] = fs.readFileSync(path.join(templatesDir, fileName), 'utf8');
});

module.exports = templates;
