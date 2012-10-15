#!/usr/bin/env node
var fs = require("fs");
var cons = require("consolidate");
var watch = require('watchfd').watch;

var http_proxy = require("http-proxy");
var Config = require("../lib/config");

var log = require("../lib/util").log;

log("Starting Hoodie Service");

var config = read_config({
  apps: {}
});



// start admin app, second try

start_dns();
var httpd = start_httpd();
watch("/Users/jan/.hoodie.json", function(current, previous) {
  if(current.mtime.getTime() <= previous.mtime.getTime()) { // make content-based
    return;
  }
  log("reloading hoodie proxy");
  httpd.close(function() {

    httpd = start_httpd();
  });
});



// util

function start_httpd()
{
  function make_routes()
  {
    // {
    //   "localhost": "127.0.0.1:80"
    //   "hoodie.dev": "127.0.0.1:1050"
    //   "api.hoodie.dev": "127.0.0.1:1051"
    //   "app.hoodie.dev": "127.0.0.1:8000",
    //   "api.app.hoodie.dev": "127.0.0.1:8001",
    //   "foo.hoodie.dev": "127.0.0.1:8100",
    //   "api.foo.hoodie.dev": "127.0.0.1:8101",
    // }
    var routes = {};
    routes["localhost"] = "127.0.0.1:80";
    routes["hoodie.dev"] = "127.0.0.1:1050";
    routes["api.hoodie.dev"] = "127.0.0.1:1051";
    var cfg = new Config();
    var apps = cfg.get_apps();
    for(var app in apps) {
      routes[app + ".hoodie.dev"] = "127.0.0.1:" + apps[app].port;
      routes["api." + app + ".hoodie.dev"] = "127.0.0.1:" + (apps[app].port + 1)
        + "/127.0.0.1:" + (apps[app].port + 2) + "/";
    }
    // log(routes);
    return routes;
  }
  var routes = make_routes();
  var server = http_proxy.createServer({
    router: routes
  });
  server.listen(5999);
  log("httpd running");
  return server;
}

function start_dns()
{
  log("starting dns");
  var dnsserver = require("dnsserver");

  var server = dnsserver.createServer();

  server.on("request", function(req, res) {
    var question = req.question;

    if (question.type == 1 && question.class == 1) {
      // IN A query
      res.addRR(question.name, 1, 1, 600, "127.0.0.1");
    } else {
      res.header.rcode = 3; // NXDOMAIN
    }

    res.send();
  });

  server.on("message", function(m) {
    // log(m);
  });

  server.on("error", function(e) {
    log(e);
  });
  server.bind(3333, "127.0.0.1");
  log("DNS is a go");
}

function read_config(defaults)
{
  try {
    var config = JSON.parse(fs.readFileSync(process.env["HOME"] + "/.hoodie.json"));
    for(var name in defaults) {
      if(!config[name]) {
        config[name] = defaults[name];
      }
    }
    return config;
 } catch(e) {
  log(e);
  return defaults;
 }
}

function has_apps()
{
  return JSON.stringify(config.apps) !== "{}";
}