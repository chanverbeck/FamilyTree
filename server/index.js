var express = require('express');
var pg = require('pg');

var config = require('./config.json');
var conString = config.familyTreeConnectionString;
var port = config.serverPort;
console.log('Connection String: ' + config.familyTreeConnectionString);
console.log('port: ' + config.serverPort);

var client = new pg.Client(conString);
client.connect();

var app = express();

app.get('/', function(request, response) {
//   response.send('Hello, world!');
   response.sendFile(__dirname+'/showme.html');
});

app.get('/bla', function(request, response) {
    var q = client.query('SELECT * FROM people WHERE pid = 1;');
    q.on('row', function(row) {
      console.log('pid = ' + row.pid);
      console.log('name = ' + row.name);
      response.send('person (' + row.pid + '): ' + row.name);
    });
   // response.sendFile(__dirname+'/showme.html');
});

app.get('/person/:personId', function(request, response) {
    var personId = request.params.personId;
    console.log('/person/' + request.params.personId);
    var res = {};
    var husband;
    var wife;
    var familyPersonIsAParentOf;
    var familyPersonIsAChildOf;
    client.query('SELECT * FROM people WHERE pid = $1;', [request.params.personId]).on('row', function(row) {
      console.log('pid = ' + row.pid);
      console.log('name = ' + row.name);
      console.log('stringified: ' + JSON.stringify(row));
      res.person = row;
    });

    // Get spouse and children.
    client.query('SELECT * FROM families WHERE wife = $1;', [personId]).on('row', function(row) {
        console.log ('husband: ' + JSON.stringify(row));
        husband = row.husband;
        familyPersonIsAParentOf = row.fid;
        res.family = row;
    });
    client.query('SELECT * FROM families WHERE husband = $1;', [personId]).on('row', function(row) {
        console.log ('wife: ' + JSON.stringify(row));
        wife = row.wife;
        familyPersonIsAParentOf = row.fid;
        res.family = row;
    }).on('end', function() {
        // console.log ('find husband or wife');
        var spouse;

        if (wife) {
            spouse = wife;
        } else if (husband) {
            spouse = husband;
        }
        if (spouse) {
            // console.log('found spouse: ' + spouse);
            client.query('SELECT * FROM people WHERE pid = $1;', [spouse]).on('row', function(row) {
                res.spouse = row;
            });
        }
        if (familyPersonIsAParentOf) {
            client.query('SELECT people.* FROM people, children WHERE people.pid = children.pid AND children.fid = $1;', [familyPersonIsAParentOf]).on('row', function(row, result) {
                console.log('found child' + row.pid);
                result.addRow(row);
            }).on('end', function(result) {
                var childrenJson = JSON.stringify(result.rows);
                console.log('children: ' + childrenJson);
                res.children = result.rows;
            });
        }

        // Get parents.
        client.query('SELECT people.* FROM families, children, people WHERE families.fid = children.fid AND children.pid = $1 AND people.pid = families.husband;', [personId]).on('row', function(row, result) {
            console.log("father: " + JSON.stringify(row));
            res.father = row;
        });
        client.query('SELECT people.* FROM families, children, people WHERE families.fid = children.fid AND children.pid = $1 AND people.pid = families.wife;', [personId]).on('row', function(row, result) {
            console.log("mother: " + JSON.stringify(row));
            res.mother = row;
        }).on('end', function() {
            response.send(JSON.stringify(res));
        });
    });

});

var server = app.listen(port, function() {
   var host = server.address().address;
   var port = server.address().port;

   console.log('Example app listening at http://%s:%s', host, port);
});
