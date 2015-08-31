var React = require('react');
var Person = require('./Person');

module.exports = React.createClass({
    getInitialState: function() {
        return { from: this.props.from };
    },
    render: function() {
        return (
            <div>
                <input id='number'/>
                <button>Go</button>
                <Person person={this.getPerson(1)}/>
            </div>
        );
    },
    
    getPerson: function(index) {
        if (typeof(XMLHttpRequest) == "function") {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open ('GET', '/person/' + index, false);
            // xmlHttp.open ('GET', '/bla', false);
            xmlHttp.send (null);
            return "Person(" + index + ") " + xmlHttp.responseText;
        } else {
            return "Person(" + index + ") " + "No XMLHttpRequest";
        }
    }

});
