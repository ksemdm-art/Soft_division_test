module.exports = {
    protocol : process.env.LGM_TOIR_APP_PROTOCOL || 'http',
    host     : process.env.LGM_TOIR_APP_HOST     || '127.0.0.1',
    port     : process.env.LGM_TOIR_APP_PORT     || 3737,
    pages    : [
        { path : 'src/client/pages' }
    ],
    routes   : [
        { path : 'src/server/pages', prefix : ''    }
    ],
    static   : []
}
