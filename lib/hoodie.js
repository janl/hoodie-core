// Hoodie Service Library
var fs = require("fs");
var exec = require("child_process").exec;

var Config = require("./config.js");

require("shelljs/global"); // GIMMEH!

exports.setup = function hoodie_setup()
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

