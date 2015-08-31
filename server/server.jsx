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
    console.log('GET /person/' + request.params.personId);
    var res = {};
    var familyPersonIsAParentOf;

    client.query('SELECT * FROM people WHERE pid = $1;', [request.params.personId]).on('row', function(row) {
      console.log('pid = ' + row.pid);
      console.log('name = ' + row.name);
      console.log('stringified: ' + JSON.stringify(row));
      res.person = row;
      res.families = [];
    });

    // Get spouse and children.
    client.query('SELECT * FROM families, people WHERE (families.wife = $1 AND people.pid = families.husband) OR (families.husband = $1 AND people.pid = families.wife)', [personId]).on('row', function(row) {
        console.log("spouse?? " + JSON.stringify(row));
        var family = {};
        family.spouse = row;
        family.children = [];
        familyPersonIsAParentOf = row.fid;
        if (familyPersonIsAParentOf) {
            client.query('SELECT people.* FROM people, children WHERE people.pid = children.pid AND children.fid = $1;', [familyPersonIsAParentOf]).on('row', function(row, result) {
                console.log('found child' + row.pid);
                family.children.push(row);
//                result.addRow(row);
            }).on('end', function() {
//                var childrenJson = JSON.stringify(result.rows);
//                console.log('children: ' + childrenJson);
                res.families.push(family);
            });
        }
    }).on('end', function() {

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

   console.log('App listening at http://%s:%s', host, port);
});