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

app.get('/person/:personId', function(request, response) {
    var personId = request.params.personId;
    console.log('/person/' + request.params.personId);
    var res = {};
    var familyPersonIsAParentOf;

    client.query('SELECT * FROM people WHERE pid = $1;', [request.params.personId]).on('row', function(row) {
      console.log('pid = ' + row.pid);
      console.log('name = ' + row.name);
      console.log('stringified: ' + JSON.stringify(row));
      res.person = row;
    });

    // Get spouse and children.
    client.query('SELECT * FROM families, people WHERE (families.wife = $1 AND people.pid = families.husband) OR (families.husband = $1 AND people.pid = families.wife)', [personId]).on('row', function(row) {
        console.log("spouse?? " + JSON.stringify(row));
        res.spouse = row;
        familyPersonIsAParentOf = row.fid;
    }).on('end', function() {
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
