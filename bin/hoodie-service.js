#!/usr/bin/env node
var express = require("express");
var fs = require("fs");
var cons = require("consolidate");
var Config = require("../lib/config");
var watch = require('watchfd').watch;
var http_proxy = require("http-proxy");


var app = express();

var config = read_config({
  apps: {}
});

console.log("Configuration: %j", config);

app.engine("html", cons.hogan);
app.set("view engine", "html");
app.set("views", "web/views");

app.get("/", function(req, res) {
  if(!has_apps()) {
    // var apps = get_app_info(config.apps);
    res.render("list_of_apps.html", {
      apps: "apps"
    });
  } else {
    res.render("first_run.html");
  }
});

start_dns();
var httpd = start_httpd();
watch("/Users/jan/.hoodie.json", function(current, previous) {
  if(current.size == previous.size) { // make content-based
    return;
  }
  console.log("reloading hoodie proxy");
  httpd.close(function() {

    httpd = start_httpd();
  })
});

app.listen(1235);
console.log("Listening on port 1235");


// util

function start_httpd()
{
  function make_routes()
  {
    // {
    //   "app.hoodie.local": "127.0.0.1:8000",
    //   "foo.hoodie.local": "127.0.0.1:8100"
    // }
    var routes = {};
    var cfg = new Config();
    var apps = cfg.get_apps();
    for(var app in apps) {
      routes[app + ".hoodie.local"] = "127.0.0.1:" + apps[app].port;
    }
    return routes;
  }
  var routes = make_routes();
  var server = http_proxy.createServer({
    router: routes
  });
  server.listen(5999);
  console.log("httpd running");
  return server;
}

function start_dns()
{
  console.log("starting dns");
  var dnsserver = require("dnsserver");

  var server = dnsserver.createServer();

  server.on("request", function(req, res) {
    // console.log("req = ", req);
    var question = req.question;

    if (question.type == 1 && question.class == 1) {
      // IN A query
      res.addRR(question.name, 1, 1, 3600, "127.0.0.1");
    } else {
      res.header.rcode = 3; // NXDOMAIN
    }

    res.send();
  });

  server.on("message", function(m) {
    // console.log(m);
  });

  server.on("error", function(e) {
    throw e;
  });
  server.bind(3333, "127.0.0.1");
  console.log("DNS is a go");
}

function read_config(defaults)
{
  try {
    var config = JSON.parse(fs.readFileSync("/Users/jan/.hoodie.json"));
    for(var name in defaults) {
      if(!config[name]) {
        config[name] = defaults[name];
      }
    }
    return config;
 } catch(e) {
  console.log(e);
  return defaults;
 }
}

function has_apps()
{
  console.log(JSON.stringify(config.apps));
  return JSON.stringify(config.apps) !== "{}";
}