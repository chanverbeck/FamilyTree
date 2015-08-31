var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <html>
                <head>
                    <title>Family Tree</title>
                    <link rel='stylesheet' type='text/css' href='css/theme.css'/>
                </head>
                <body>
                    <div id="uiContainer" />
                    <div id="personContainer"
                        dangerouslySetInnerHTML = { {__html: this.props.content} } />
                </body>
                <script src="/pages/index.js"></script>
            </html>
        );
    }
});
