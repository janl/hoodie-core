#!/usr/bin/env node
var express = require("express");
var fs = require("fs");
var cons = require("consolidate");

var app = express();

var config = read_config({
  apps: {}
});

console.log("Configuration: %j", config);

app.engine("html", cons.hogan);
app.set("view engine", "html");
app.set("views", "web/views");

app.get("/", function(req, res) {
  if(has_apps()) {
    // var apps = get_app_info(config.apps);
    res.render("list_of_apps.html", {
      apps: "apps"
    });
  } else {
    res.render("first_run.html");
  }
});

app.listen(1235);
console.log("Listening on port 1235");


// util

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