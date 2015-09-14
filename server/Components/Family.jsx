var React = require('react');
var Person = require('./Person');
var PersonStore = require('../Stores/PersonStore');

module.exports = React.createClass({
    render: function() {
//        console.log('Family.render pid: ' + JSON.stringify(this.props.person));
        return <div>
            {this.renderFather(this.props.person)}
            {this.renderMother(this.props.person)}
            {this.renderSelf(this.props.person)}
            {this.renderFamilies(this.props.person)}
        </div>;
    },
    
    renderFather: function(person) {
        if (person && person.father) {
//            console.log('have father' + JSON.stringify(person.father));
            return <Person class='parent' person={person.father} />;
        }
        return null;
    },
    
    renderMother: function(person) {
        if (person && person.mother) {
//            console.log('have mother' + JSON.stringify(person.mother));
            return <Person class='parent' person={person.mother} />;
        }
        return null;
    },
    
    renderSelf: function(person) {
        if (person && person.person) {
//            console.log('render of: ' + JSON.stringify(person.person));
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

function navigateTo(personId)
{
    console.log ('global function navigateTo');
    PersonStore.navigateTo(personId);
}