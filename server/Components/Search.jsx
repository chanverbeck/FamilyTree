var React = require('react');
var PersonActions = require('../Actions/PersonActions');


module.exports = React.createClass({
	getInitialState: function() {
		return {searchString: ""}; 
	},
	search: function() {
        if (typeof(XMLHttpRequest) == "function") {
			var name = this.state.searchString;
            // console.log ("Search for '" + name + "'");
			if (name === "") {
				return;
			}
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open ('GET', '/search/' + name, false);
            xmlHttp.send (null);
			
            var response = JSON.parse(xmlHttp.responseText);
			// console.log ('fetched ' + xmlHttp.responseText);
			if (response.pid > 0)
			{
				PersonActions.navigateTo(response.pid);
			} else {
				// console.log("no more people of name: " + name);
			}
        } else {
            console.log ("Don't search for " + name);
        }
	},
	checkForEnter: function(e) {
		if (e.key == 'Enter') {
			this.search();
		}
	},
	saveState: function(e) {
		this.state.searchString = e.target.value;
	},
    render: function() {
		return (
			<div>
				<input type="text"
					onKeyPress={this.checkForEnter} 
					onKeyUp={this.saveState} />
				<button onClick={this.search}>Go</button>
			</div>
		);
	}
});