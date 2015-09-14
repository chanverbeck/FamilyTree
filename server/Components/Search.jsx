var React = require('react');
var PersonActions = require('../Actions/PersonActions');

module.exports = React.createClass({
	search: function() {
        if (typeof(XMLHttpRequest) == "function") {
            console.log ("Search");
			var name = "Huang";
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open ('GET', '/search/' + name, false);
            xmlHttp.send (null);
			
            var response = JSON.parse(xmlHttp.responseText);
			console.log ('fetched ' + xmlHttp.responseText);
			if (response.pid > 0)
			{
				PersonActions.navigateTo(response.pid);
			} else {
				console.log("no more people of name: " + name);
			}
        } else {
            console.log ("Don't get search for " + name);
        }
	},
    render: function() {
		return (
			<div>
				<input type="text"/>
				<button onClick={this.search}>Go</button>
			</div>
		);
	}
});