var fs = require("fs");
var daemon = require("daemonize2");
var spawn = require("child_process").spawn;

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
};

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
    // start web
    this.get_web_service().start();
    // start database
    this.db_start();
    // start cors proxy
    this.get_cors_service().start();
};

HoodieApp.prototype.stop = function hoodie_app_stop()
{
    console.log("Stopping HoodieApp(%s)", this._name);
    // stop web
    this.get_web_service().stop();
    // stop db
    this.db_stop();
    // stop cors proxy
    this.get_cors_service().stop();
};

HoodieApp.prototype.get_web_service = function hoodie_app_get_web_service()
{
    var name = this._name;
    var path = this._path;
    var port = 1236; // figure out dynamic ports

    var daemon_spec = {
        main: "./node_modules/.bin/http-server",
        args: [path + "/www", "-p " + port, "-s"],
        name: name,
        pidfile: "/tmp/hoodie-" + name + ".pid"
    };
    return daemon.setup(daemon_spec);
};

HoodieApp.prototype.get_cors_service = function hoodie_app_get_cors_service()
{
    var name = this._name;
    var path = this._path;
    var port = 7000; // figure out dynamic ports

    var daemon_spec = {
        main: "./node_modules/corsproxy/server.js",
        args: ["7000"], // dynports
        name: name + "-cors",
        pidfile: "/tmp/hoodie-" + name + "-cors.pid"
    };
    return daemon.setup(daemon_spec);
};
HoodieApp.prototype.db_start = function hoodie_app_db_start()
{
    var out = fs.openSync("/tmp/out.log", "a");
    var err = fs.openSync("/tmp/err.log", "a");
    var name = this._name;

    var ini = [
        "[httpd]",
        "port = 6000"
    ].join("\n");
    var ini_file = "/tmp/hoodie-" + name + "-db.ini";
    fs.writeFileSync(ini_file, ini);

    var couch = spawn("/Users/jan/Work/homebrew/bin/couchdb", [
        "-b",
        "-r 5",
        "-o /tmp/hoodie-" + name + "-db.stdout",
        "-e /tmp/hoodie-" + name + "-db.stderr",
        "-p /tmp/hoodie-" + name + "-db.pid",
        "-a " + ini_file
        ], {
        stdio: ["ignore", out, err],
        env: process.env
    });
    couch.on('exit', function (code) {
      if(code > 0) {
          console.log('child process exited with code ' + code);
      }
    });
}

HoodieApp.prototype.db_stop = function hoodie_app_db_stop()
{
    var out = fs.openSync("/tmp/out.log", "a");
    var err = fs.openSync("/tmp/err.log", "a");
    var couch = spawn("/Users/jan/Work/homebrew/bin/couchdb", [
        "-d"
        ], {
        stdio: ["ignore", out, err],
        env: process.env
    });
    couch.on('exit', function (code) {
      if(code > 0) {
          console.log('child process exited with code ' + code);
      }
    });
}
