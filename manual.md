# Hoodie CLI

Using Hoodie from the command line.

## Installation

    $ brew install hoodie

Installs node, npm & CouchDB

## Quick Start

    $ hoodie new myapp
    $ [sudo] hoodie start myapp
    Starting 'myapp'...done.
    Visit 'myapp' at http://myapp.hoodie.local
    $ open http://myapp.hoodie.local # browser opens


## Usage

    Usage: hoodie cmd
    cmd is one of:
      new appname    Creates new Hoodie app in ./appname
      start          Starts the Hoodie app in ./
      start appname  Starts the Hoodie app appname
      service-start  Starts the Hoodie service
      usage          Prints this screen

### `hoodie new whiskie`

This command creates a new hoodie applicate with the name `whiskie`. It creates a new directory `whiskie` in the current directory and sets up everything you need to develop and run your app.


## Architecture

This section explains what goes on behind the scenes when you install hoodie, or create new applications.


### `brew install hoodie`

This installs the `hoodie` command and all its dependencies.

These are:

 - node
 - CouchDB

Hoodie itself ships with a bit of library code and sub-applications itself. We’ll explore them now.

### `hoodie`

`hoodie` is the command line tool that lets you do anything hoodie. It is a Node.js program that builds on sub-tools and a library of functions.

`hoodie` allows you to create new apps and start and stop exiting apps. // TBD what else?

### `hoodie new myapp`

`hoodie new myapp` does a number of things:

 1. Create a new directory $CWD/myapp, if that directory doesn’t exist already.
 2. It clones an empty application skeleton from Github.
 3. It does some customisations based on your environment.
 [Ideally, 2. and 3. should be a single step, and not require net access.]
 4. Set up the `myapp.hoodie.local` domain.

`sudo hoodie new myapp` for the time being, `hoodie new myapp` needs to be called with `sudo`. We hope to relax that requirement in the future. We don’t do anything nefarious, promised :) — We only need root access to setup the fancy `myapp.hoodie.local` domain names on your system.

### `hoodie start myapp`

`hoodie start myapp` launches all services required to run your application. The services include:

 - *hoodie-service*, if it is not already running.
 - A custom instance of *CouchDB*, just for your application.
 - A custom instance of *Hoodie’s CORS proxy*, just for your application.


#### hoodie-service

*hoodie-service* is a Node.js daemon that provides multiple services. You only need one instance of hoodie-service running for any number of apps you might be running or developing on your system. `hoodie start myapp` will automatically start hoodie-service, if it is not already running.

The services it provides are:

 - HTTP proxying, so that `myapp.hoodie.local` can be served over HTTP port 80.
 - DNS resolution, so `myapp.hoodie.local` can be resolved to 127.0.0.1:80.
 - A web app administration interface for all your installed hoodie applications, served on `http://hoodie.local/

#### Custom CouchDB Instance

Each hoodie app is powered by a CouchDB isntance as their main data storage. Each hoodie application has a system directory that keeps all the database related configuration and data that is different from the application code directory that you will be developing with. `hoodie` takes care of setting things up correctly. The hoodie web administration interface has access to log files, database status and data.

#### CORS Proxy

The CORS proxy is required to make cross-domain requests to the hoodie API from your hoodie application. CouchDB does not yet allow for CORS requests hence we need that proxy. We will use it for other features that we need on CouchDB in the future.
