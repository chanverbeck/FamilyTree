var React = require('react');
var Person = require('./Person');

module.exports = React.createClass({
    getInitialState: function() {
        return { person: this.props.person };
    },
    render: function() {
        return <div>
            {this.renderFather(this.state.person)}
            {this.renderMother(this.state.person)}
            {this.renderSelf(this.state.person)}
            {this.renderFamilies(this.state.person)}
        </div>;
    },
    renderFather: function(person) {
        if (person && person.father) {
    console.log('have father');
            return <Person class='parent' person={person.father} />;
        }
        return null;
    },
    renderMother: function(person) {
        if (person && person.mother) {
    console.log('have mother');
            return <Person class='parent' person={person.mother} />;
        }
        return null;
    },
    renderSelf: function(person) {
    console.log('render of: ' + JSON.stringify(person));
        if (person && person.person) {
    console.log('have person');
            return <Person person={person.person} />;
        }
        return null;
    },
    renderFamilies: function(person) {
        if (person && person.families) {
            return <div>{person.families.map(this.renderFamily)}</div>
        }
        return null;
    },
    renderFamily: function(family) {
        return (<div>
            {this.renderSpouse(family)}
            {this.renderChildren(family)}
        </div>);
    },
    renderSpouse: function(family) {
        if (family.spouse) {
            return <Person class='spouse' person={family.spouse}/>
        }
        return null;
    },
    
    renderChildren: function (family) {
        if (family.children) {
            return <div>{family.children.map(this.renderChild)}</div>
        }
        return null;
    },
    
    renderChild: function(person) {
        return <Person class='child' person={person}/>
    }
});


