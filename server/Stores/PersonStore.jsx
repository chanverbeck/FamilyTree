var alt = require('../libs/alt');
var PersonActions = require('../Actions/PersonActions');

function PersonStore() {
	this.personId = 1;
	
	this.bindListeners({
		navigateTo: PersonActions.navigateTo
	});
}

PersonStore.prototype.navigateTo = function(personId) {
	// console.log('PersonStore.prototype.navigateTo(' + personId + ')');
	this.setState({
		personId: personId
	});
};

PersonStore.displayName = 'PersonStore';

var personStore = alt.createStore(PersonStore);

module.exports = personStore;