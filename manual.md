# Hoodie CLI

Using Hoodie from the command line.

## Installation

    $ brew install hoodie

Installs node, npm & CouchDB

## Quick Start

    $ brew install hoodie
    $ hoodie app whiskie
    Creating new app: "whiskie".
    Done.
    $ cd whiskie
    $ hoodie server
    Starting app "whiskie".
    Done.
    Open "whiskie" in your browser? (Y/n): Y
    # browser opens
    Done.


## Usage

    $ `./hoodie`
    Usage:
      hoodie app whiskie            Create new app `whiskie`.
      hoodie server [/path/to/app]  Run current or specified app.

### `hoodie app whiskie`

This command creates a new hoodie applicate with the name `whiskie`. It creates a new directory `whiskie` in the current directory and sets up everything you need to develop and run your app.

