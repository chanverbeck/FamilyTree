var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        return { personString: "PS" + this.props.person };
    },
    render: function() {
        return <div>Person! value: {this.state.personString}</div>
    },
});


