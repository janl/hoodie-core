var fs = require("fs");
var util = require("util");

exports.log = function log() {
  var message = util.format.apply(this, arguments);
  fs.appendFileSync("/var/log/hoodie/service.log", message + "\n");
}
