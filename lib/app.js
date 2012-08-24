var fs = require("fs");
var daemon = require("daemonize2");

// use like this: var app = new HoodieApp("name");
module.exports = HoodieApp;

function HoodieApp(name)
{
    this._name = name;

    // read path from ~/.hoodie.json
    this._path = this._read_app_path(name);
    this._config = this._read_app_config(this._path);
}

HoodieApp.prototype._read_app_path = function _read_app_path(app_name)
{
    // console.log("reading hoodie config for " + app_name);
    var hoodie_config = JSON.parse(fs.readFileSync("/Users/jan/.hoodie.json"));
    if(hoodie_config.apps[app_name]) {
        return hoodie_config.apps[app_name];
    } else {
        throw("app '" + app_name + "' not found");
    }
}

HoodieApp.prototype._read_app_config = function _read_app_config(path)
{
    var filename = path + "/package.json";
    try {
        return JSON.parse(fs.readFileSync(filename));
    } catch(e) {
        throw("Error reading app configuration from " + filename);
    }
};

HoodieApp.prototype.start = function hoodie_app_start()
{
    console.log("Starting HoodieApp(%s)", this._name);
    this.get_daemon().start();
};

HoodieApp.prototype.stop = function hoodie_app_stop()
{
    console.log("Stopping HoodieApp(%s)", this._name);
    this.get_daemon().stop();
};

HoodieApp.prototype.get_daemon = function hoodie_app_get_daemon()
{
    var name = this._name;
    var path = this._path;
    var port = 1236; // figure out dynamic ports

    var daemon_spec = {
        main: path + "/node_modules/.bin/http-server",
        args: [path + "/www", "-p " + port, "-s"],
        name: name,
        pidfile: "/tmp/hoodie-" + name + ".pid"
    };
    return daemon.setup(daemon_spec);
};
