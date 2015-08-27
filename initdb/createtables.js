/* global __dirname */
console.log('Do things');

var parseGedcom = require('./parsegedcom.js');
var config = require('./config.json');

var fs = require('fs');
var path = require('path');

var pg = require('pg');
var conString = config.familyTreeConnectionString;

var client = new pg.Client(conString);
client.connect();

var filePath = path.join(__dirname, 'VERBECK-Small.ged');
console.log ('open file: ' + filePath);

client.query('DROP TABLE IF EXISTS people;');
client.query('DROP TABLE IF EXISTS families;');
client.query('DROP TABLE IF EXISTS children;');

client.query('CREATE TABLE people (' +
                'pid integer PRIMARY KEY,' +
                'name varchar(250),' +
                'birthdate varchar(250),' +
                'birthplace varchar(250),' +
                'deathdate varchar(250),' +
                'deathplace varchar(250)' +
                ');');

client.query('CREATE TABLE families (' +
                'fid integer PRIMARY KEY,' +
                'husband integer,' +
                'wife integer,' +
                'marriagedate varchar(250),' +
                'marriageplace varchar(250)' +
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
   var familyTree = parseGedcom(gedcom);
   console.log ('lines = ' + familyTree.lines + '. people = ' + familyTree.people.length + '.');

   var i;
   var j;
   var person;
   for (i = 0; i < familyTree.people.length; ++i) {
      person = familyTree.people[i];
      if (person) {
         console.log('add person: ' + person.index + ': ' + person.name);

         client.query('INSERT INTO people(pid, name, birthdate, birthplace, deathdate, deathplace) values($1, $2, $3, $4, $5, $6);',
               [person.index, person.name, person.birthdate, person.birthplace, person.deathdate, person.deathplace]);
      }
   }   

   var family;
   for (i = 0; i < familyTree.families.length; ++i) {
      family = familyTree.families[i];
      if (family) {
         console.log('add family: ' + family.index + ': ' + family.husband + ', ' + family.wife);

         client.query('INSERT INTO families (fid, husband, wife, marriagedate, marriageplace) values($1, $2, $3, $4, $5);', 
               [family.index, family.husband, family.wife, family.marriagedate, family.marriageplace]);

         if (family.children) {
            for (j = 0; j < family.children.length; ++j) {
               console.log('add child relationship ' + family.children[j] + ' in ' + family.index);
               client.query('INSERT INTO children (pid, fid) values($1, $2);',
                  [family.children[j], family.index]);
            }
         }
      }
   }   

   console.log('wait to be sure we\'re done.');
   var q = client.query('SELECT * FROM families WHERE fid = 1;');
   q.on('end', function() {
      client.end();
   });
}
