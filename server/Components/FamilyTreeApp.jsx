var React = require('react');
var Family = require('./Family');

module.exports = React.createClass({
    getInitialState: function() {
        return { from: this.props.from };
    },
    render: function() {
        return (
            <div>
                <input id='number'/>
                <button>Go</button>
                <Family person={this.getPerson(1)}/>
            </div>
        );
    },
    
    getPerson: function(index) {
        if (typeof(XMLHttpRequest) == "function") {
            console.log ("Get person " + index);
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open ('GET', '/person/' + index, false);
            // xmlHttp.open ('GET', '/bla', false);
            xmlHttp.send (null);
            return JSON.parse(xmlHttp.responseText);
        } else {
            console.log ("Don't get person " + index);
            return {};
        }
    }

});
