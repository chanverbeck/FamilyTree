console.log('Do things');

var parseGedcom = require('./parsegedcom.js');

var fs = require('fs');
var path = require('path');

var pg = require('pg');
var conString = 'postgres://chan:chan@localhost:5432/familytree';

var client = new pg.Client(conString);
client.connect();

var filePath = path.join(__dirname, 'VERBECK-Small.ged');
console.log ('open file: ' + filePath);

client.query('DROP TABLE IF EXISTS people;');
client.query('DROP TABLE IF EXISTS families;');
client.query('DROP TABLE IF EXISTS children;');

client.query('CREATE TABLE people (' +
                'pid integer PRIMARY KEY,' +
                'name varchar(50)' +
                ');');

client.query('CREATE TABLE families (' +
                'fid integer PRIMARY KEY,' +
                'husband integer,' +
                'wife integer' +
                ');');

client.query('CREATE TABLE children (' +
                'pid integer,' +
                'fid integer' +
                ');');

fs.readFile(filePath, null, function(err, data) {
   if (!err) {
      processData('' + data);
   } else {
      console.log('error: ' + err);
   }
});

function processData (gedcom)
{
   // Parse the data.
   console.log ('parseGedcom');
   familyTree = parseGedcom(gedcom);
   console.log ('lines = ' + familyTree.lines + '. people = ' + familyTree.people.length + '.');

   var i;
   var j;
   var person;
   for (i = 0; i < familyTree.people.length; ++i) {
      person = familyTree.people[i];
      if (person) {
         console.log('add person: ' + person.index + ': ' + person.name);

         client.query('INSERT INTO people(pid, name) values($1, $2);', [person.index, person.name]);
      }
   }   

   var family;
   for (i = 0; i < familyTree.families.length; ++i) {
      family = familyTree.families[i];
      if (family) {
         console.log('add family: ' + family.index + ': ' + family.husband + ', ' + family.wife);

         client.query('INSERT INTO families (fid, husband, wife) values($1, $2, $3);', [family.index, family.husband, family.wife]);

         if (family.children) {
            for (j = 0; j < family.children.length; ++j) {
               console.log('add child relationship ' + family.children[j] + ' in ' + family.index);
               client.query('INSERT INTO children (pid, fid) values($1, $2);',
                  [family.children[j], family.index]);
            }
         }
      }
   }   

   var q = client.query('SELECT * FROM families WHERE fid = 1;');
   q.on('row', function(row) {
      console.log('fid = ' + row.fid);
      console.log('husband = ' + row.husband);
      console.log('wife = ' + row.wife);
   });
   q.on('end', function() {
      client.end();
   });
}
