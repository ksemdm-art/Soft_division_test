const config = require('./config');
const App    = require('./server/app/App');

global.App = new App();
if (config.isProd) {
    global.App.start();
} else {
    global.App.startDevelopment();
}