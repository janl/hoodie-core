var fs = require("fs");

module.exports = Config;

function Config()
{
  this.config_file = process.env["HOME"] + "/.hoodie.json";
  this._read_config();
}

Config.prototype.get = function hoodie_config_get(key, _default)
{
  return this.config[key] || _default || null;
}

Config.prototype.set = function hoodie_config_set(key, value)
{
  this.config[key] = value;
  this._write_config();
}

Config.prototype.add_app = function hoodie_config_add_app(name, values)
{
  if(this.config.apps[name]) {
    console.log("App '" + name + "' already exists, please choose another name");
    throw("App '" + name + "' already exists, please choose another name")
  }

  this.config.apps[name] = values;
  this._write_config();
}

Config.prototype._read_config = function hoodie_config_read_config()
{
  try {
    this.config = JSON.parse(fs.readFileSync(this.config_file));
  } catch (e) {
    // no config, create new;
    var config = {apps:{"hoodie_web":{path:__dirname + "../web", port:1050}}};
    fs.writeFileSync(this.config_file, JSON.stringify(config));
    this.config = config;
  }
  // console.log("Reading this config: %j", this.config);
}

Config.prototype._write_config = function hoodie_config_write_config()
{
  // console.log("Writing this config: %j", this.config);
  fs.writeFileSync(this.config_file, JSON.stringify(this.config));
}

Config.prototype.get_apps = function hoodie_config_get_apps()
{
  var user_apps = {};
  for(var name in this.config.apps) {
    if(name != "hoodie_web") {
      user_apps[name] = this.config.apps[name];
    }
  }
  return user_apps;
}

Config.prototype.get_max_port = function hoodie_config_get_max_port()
{
  var max_port = 1100;
  for(var app in this.config.apps) {
    var port = this.config.apps[app].port;
    console.log("App %s has port %d", app, port);
    if(port > max_port) {
      max_port = port;
    }
  }
  return max_port;
}