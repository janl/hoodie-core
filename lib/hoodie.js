// Hoodie Service Library
var fs = require("fs");
var exec = require("child_process").exec;
var daemon = require("daemonize2");

var Config = require("./config.js");

require("shelljs/global"); // GIMMEH!

exports["setup"] = function hoodie_setup()
{
  // got root?
  if(process.getuid() !== 0) {
    console.log("Please use: 'sudo hoodie setup'");
    console.log("We hope to remove the sudo requirement in the future. Sorry about that!");
    return;
  }
  try {
  // create /etc/resolver/#{name}.hoodie.dev
  console.log("DNS’in.");
  var contents = [
    "nameserver 127.0.0.1",
    "port 3333"
  ].join("\n");
  fs.writeFileSync("/tmp/hoodie-resolver.tmp", contents);
  // mkdir -p /etc/resolver
  mkdir("-p", "/etc/resolver");
  exec("cp /tmp/hoodie-resolver.tmp /etc/resolver/hoodie.dev");

  console.log("Firewallin’.");
  var cmd = "launchctl load -Fw " + __dirname + "/../etc/ie.hood.firewall.plist"
  exec(cmd, function(error, stdout, stderr) {
    if(error) { throw error };
    console.log("Setup done, thanks for your patience!");
    console.log("What do you want to do next?");
    console.log("Type 'hoodie' for options.");
  });

  // create var log hoodie, make group writeable
  var varloghoodie = "/var/log/hoodie";
  mkdir("-p", varloghoodie);
  chgrp("admin", varloghoodie);
  chmod("g+w", varloghoodie);
  } catch(e) {
    console.log("hoodie setup failed: %s", e);
    return;
  }
  // setup went fine
  var config = new Config();
  config.set("setup", true);
};

exports["service_start"] = function hoodie_service_start()
{
  var service = get_hoodie_service();
  service.start();
};

exports["service_restart"] = function hoodie_service_restart()
{
  var service = get_hoodie_service();
  service.stop(function() {
    service.start()
  });
};

exports["service_stop"] = function hoodie_service_stop()
{
  var service = get_hoodie_service();
  service.stop();
};

exports["new_app"] = function hoodie_new_app(name)
{
  // create app
  var cmd = "git clone https://github.com/hoodiehq/hoodie-app-skeleton.git " + name;
  exec(cmd, function(error, stdout, stderr) {
    if(error) {
      throw(error);
    }

    // Customise app
    var customisation = {
      hoodie_appname: name,
      hoodie_api_url: "http://api." + name + ".hoodie.dev"
    };

    var template_files = ["/www/index.html", "/package.json"];
    template_files.forEach(function(file) {
      file = name + file;
      console.log("replacing values in '%s'", file);
      for(var placeholder in customisation) {
        var replacement = customisation[placeholder];
        var matcher = new RegExp("{{" + placeholder + "}}", "g");
        sed("-i", matcher, replacement, file);
      }
    });

    try {
      // add app config to ~/.hoodie.json
      var config = new Config();
      config.add_app(name, {
        path: process.cwd() + "/" + name,
        port: config.get_max_port() + 100 // running out of ports
      });
    } catch(e) {
      // rm ./appname
      throw(e);
    }

    // update routing proxy by touching ~/.hoodie.json
    var newDate = new Date();
    fs.utimesSync(process.env["HOME"] + "/.hoodie.json", newDate, newDate);

    console.log("All done.");
    console.log("Use hoodie start " + name + " to start the new app");
  });
};

exports["delete_app"] = function hoodie_delete_app(app)
{
  // bail if app runs
  if(app.is_running()) {
    console.log("App '%s' is running, can’t delete.", app.get_name());
    return;
  }

  // rm -rf path
  rm("-rf", app.get_path());

  // config unset
  var config = new Config();
  config.delete_app(app.get_name());
};


// util

var get_hoodie_service = function get_hoodie_service()
{
    return daemon.setup({
        main: "./bin/hoodie-service.js",
        name: "service-start.js",
        pidfile: "/tmp/hoodie-service.pid"
    });
};
