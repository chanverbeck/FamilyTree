FamilyTree
===========
A simple family tree web app that uses NodeJS, React, 
Flux (using Alt), and Postgresql.

Installation
----------
To run this, you must instantiate a Postgresql server. You should npm install
to get all of the proper bits on your machine. 

Add a config.json to initdb that contains the property 
familyTreeConnectionString, set to 
postgres://&lt;role&gt;:&lt;password&gt;@localhost:&lt;portnum&gt;/familytree, using JSON. 
Then run node createtables.js.

Run gulp build to set up the bin folder, and then put a similar config.json
in that bin folder, with the additional field of serverPort set to an appropriate 
port number (8080 for development?).

