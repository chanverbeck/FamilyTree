var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        return { person: this.props.person };
    },
    render: function() {
        return (<div>
            {this.renderPerson(this.state.person)}
        </div>);
    },
    renderPerson: function(person) {
        var result = null;
        if (person && person.name) {
            return (<span>({person.pid}) {person.name}
                {(person.birthdate || person.birthplace) ? <br/>: ""} 
                {(person.birthdate || person.birthplace) ? "Born ": ""} 
                {(person.birthdate) ? person.birthdate + " ": ""}
                {(person.birthplace) ? "in " + person.birthplace: ""}
                {(person.deathdate || person.deathplace) ? <br/>: ""} 
                {(person.deathdate || person.deathplace) ? "Died ": ""} 
                {(person.deathdate) ? person.deathdate + " ": ""}
                {(person.deathplace) ? "in " + person.deathplace: ""}
            </span>);
        }
        return result;
    }
});


