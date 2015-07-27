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
    var res = '';
    var husband;
    var wife;
    client.query('SELECT * FROM people WHERE pid = $1;', [request.params.personId]).on('row', function(row) {
      console.log('pid = ' + row.pid);
      console.log('name = ' + row.name);
      res += 'person (' + row.pid + '): ' + row.name;
    });
    client.query('SELECT husband FROM families WHERE wife = $1', [personId]).on('row', function(row) {
        console.log ('husband: ' + row.husband);
        husband = row.husband;
    });
    client.query('SELECT wife FROM families WHERE husband = $1', [personId]).on('row', function(row) {
        console.log ('wife: ' + row.wife);
        wife = row.wife;
    }).on('end', function() {
        console.log ('find husband or wife');
        var spouse;

        if (wife) {
            spouse = wife;
        } else if (husband) {
            spouse = husband;
        }
        if (spouse) {
            console.log('found spouse: ' + spouse);
            res += ' married to (' + spouse + ') ';
            client.query('SELECT * FROM people WHERE pid = $1;', [spouse]).on('row', function(row) {
                res += row.name;
            }).on('end', function() {
                response.send(res);
            });
        } else {
            response.send(res);
        }
    });
});

var server = app.listen(port, function() {
   var host = server.address().address;
   var port = server.address().port;

   console.log('Example app listening at http://%s:%s', host, port);
});
