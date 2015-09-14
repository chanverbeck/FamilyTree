var React = require('react');
var PersonActions = require('../Actions/PersonActions');

module.exports = React.createClass({
    onclick: function() {
        console.log('onclick()');
        console.log('person: ' + this.props.person.pid);
        PersonActions.navigateTo(this.props.person.pid);
    },
    render: function() {
        var c;
        if (this.props.class) {
            c = this.props.class;
        } else {
            c = "person";
        }
        
        console.log('person: ' + this.props.person.pid + '. class: ' + c);
        return (<div className={c} onClick={this.onclick} >
            {this.renderPerson(this.props.person)}
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


