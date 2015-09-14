var React = require('react');
var Family = require('./Family');
var PersonStore = require('../Stores/PersonStore');
var PersonActions = require('../Actions/PersonActions');
var Search = require('./Search');

module.exports = React.createClass({
    componentDidMount: function () {
        PersonStore.listen(this.storeChanged);
    },
    componentWillUnmount: function() {
        PersonStore.unlisten(this.storeChanged);
    },
    storeChanged: function(state) {
        // console.log('Store changed to ' + state.personId);
        this.setState(state);
    },
    getInitialState: function() {
        // console.log('get initial state ' + this.props.personId);
        this.storeChanged = this.storeChanged.bind(this);
        this.state = PersonStore.getState();
        return { personId: this.state.personId };
    },
    render: function() {
        // console.log('Render FamilyTree with person ' + this.state.personId);
        return (
            <div>
                <Search />
                <Family person={this.getPerson(this.state.personId)}/>
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
