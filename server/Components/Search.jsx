var React = require('react');
var PersonActions = require('../Actions/PersonActions');


module.exports = React.createClass({
	getInitialState: function() {
		return {
			searchString: "", 
			lastSearchString: "", 
			lastSearchIndex: 0,
			lastSearchCount: 0
		}; 
	},
	search: function() {
        if (typeof(XMLHttpRequest) == "function") {
			var name = this.state.searchString;
            // console.log ("Search for '" + name + "'");
			if (name === "") {
				return;
			}
			if (name === this.state.lastSearchString) {
				if (this.state.lastSearchCount > 0) {
					this.state.lastSearchIndex++;
					if (this.state.lastSearchIndex >= this.state.lastSearchCount) {
						this.state.lastSearchIndex = 0;
					}
				}
			} else {
				this.state.lastSearchCount = 0;
				this.state.lastSearchIndex = 0;
				this.state.lastSearchString = name;
			}
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open ('GET', '/search/' + name + '/' + this.state.lastSearchIndex, false);
            xmlHttp.send (null);
			
			// console.log ('fetched ' + xmlHttp.responseText);
            var response = JSON.parse(xmlHttp.responseText);

			this.state.lastSearchString = name;
			this.state.lastSearchCount = response.totalFound;

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