var React = require('react');
var FamilyTreeApp = require('../Components/FamilyTreeApp');
var Person = require('../Components/Person');

var familyTreeElementElement = React.render(
    <FamilyTreeApp personId='79' />,
    document.getElementById('personContainer'));

//var personElement = React.render(
//    <Person />,
//    document.getElementById('reactContainer'));

//setInterval(function() {
//   familyTreeElementElement.setState({ from: "index.jsx, transformed, bundled, and running on the client"});
//   personElement.setState({ personNumber: 2 }) }, 500);
