/* global __dirname */
var React = require('react');
var Layout = require('./Components/Layout');
var FamilyTreeApp = require('./Components/FamilyTreeApp');
var express = require('express');
var path = require('path');
var pg = require('pg');

var app = express();
app.use('/pages', express.static(path.join(__dirname, 'Pages')));
app.use('/css', express.static(path.join(__dirname, 'css')));

var config = require('./config.json');
var conString = config.familyTreeConnectionString;
var port = config.serverPort;

var client = new pg.Client(conString);
client.connect();

var verbose = false;


app.get('/', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    var content = React.renderToString(
        <FamilyTreeApp from="server.jsx, Updated!" />
    );

    var html = React.renderToStaticMarkup(
        <Layout content={content} />
    );

    res.end(html);
});

app.get('/person/:personId', function(request, response) {
    var personId = request.params.personId;
    if (verbose) {
        console.log('GET /person/' + request.params.personId);
    }
    var res = {};
    var familyPersonIsAParentOf;

    client.query('SELECT * FROM people WHERE pid = $1;', [request.params.personId]).on('row', function(row) {
      if (verbose) {
        console.log('pid = ' + row.pid);
        console.log('name = ' + row.name);
        console.log('stringified: ' + JSON.stringify(row));
      }
      res.person = row;
      res.families = [];
    });

    // Get spouse and children.
    client.query('SELECT * FROM families, people WHERE (families.wife = $1 AND people.pid = families.husband) OR (families.husband = $1 AND people.pid = families.wife)', [personId]).on('row', function(row) {
        if (verbose) {
            console.log("spouse?? " + JSON.stringify(row));
        }
        var family = {};
        family.spouse = row;
        family.children = [];
        familyPersonIsAParentOf = row.fid;
        if (familyPersonIsAParentOf) {
            client.query('SELECT people.* FROM people, children WHERE people.pid = children.pid AND children.fid = $1;', [familyPersonIsAParentOf]).on('row', function(row, result) {
                if (verbose) {
                    console.log('found child' + row.pid);
                }
                family.children.push(row);
            }).on('end', function() {
                res.families.push(family);
            });
        }
    }).on('end', function() {

        // Get parents.
        client.query('SELECT people.* FROM families, children, people WHERE families.fid = children.fid AND children.pid = $1 AND people.pid = families.husband;', [personId]).on('row', function(row, result) {
            if (verbose) {
                console.log("father: " + JSON.stringify(row));
            }
            res.father = row;
        });
        client.query('SELECT people.* FROM families, children, people WHERE families.fid = children.fid AND children.pid = $1 AND people.pid = families.wife;', [personId]).on('row', function(row, result) {
            if (verbose) {
                console.log("mother: " + JSON.stringify(row));
            }
            res.mother = row;
        }).on('end', function() {
            response.send(JSON.stringify(res));
        });
    });

});

var lastSearchString = null;
var lastSearchIndex = 0;
app.get('/search/:name', function(request, response) {
    var name = request.params.name;
    if (name === lastSearchString) {
        lastSearchIndex++;
    } else {
        lastSearchString = name;
        lastSearchIndex = 0;
    }

    client.query('SELECT pid FROM people WHERE UPPER(name) LIKE UPPER($1);', ['%' + name + '%'], function(err, result) {
        var httpResult;
        if (err)
        {
            console.log('Err = ' + err);
            response.send(JSON.stringify({pid: -1}));
        } else {
            console.log('Num Rows returned = ' + result.rows.length);
            var httpResult = {totalFound: result.rows.length};

            if (result.rows.length == 0)
            {
                console.log("didn't find any " + name);
                httpResult.pid = -1;
            } else {
                if (result.rows.length <= lastSearchIndex) {
                    console.log("Wrapped: didn't find any more " + name);
                    lastSearchIndex = 0;
                    httpResult.wrappedToFirst = true;
                }
                httpResult.foundIndex = lastSearchIndex;
                httpResult.pid = result.rows[lastSearchIndex].pid;
            }
            console.log('search for ' + name + ', return ' + JSON.stringify(httpResult));
            response.send(JSON.stringify(httpResult));
        }
    });
});

var server = app.listen(port, function() {
   var host = server.address().address;
   var port = server.address().port;

   console.log('App listening at http://%s:%s', host, port);
});