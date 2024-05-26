const BodyParserMiddleware = require('body-parser');
const PageMiddleware       = require('./PageMiddleware');

module.exports = {
    express : function(express) {
        express.use(PageMiddleware);
        express.use(BodyParserMiddleware.json({
            limit: `100mb`
        }));
    }
}
