var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        return { person: this.props.person };
    },
    render: function() {
        return <div>{this.renderPerson(this.state.person)}</div>
    },
    renderPerson: function(person) {
    console.log('render person');
        if (person && person.name) {
            return "(" + person.pid + ") " + person.name;
        }
        return "";
    }
});


