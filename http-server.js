const http = require('http');
const fs = require('fs');
const path = require('path');
const wsServer = require('./ws-server.js');

const httpPort = 8001

http.createServer(function (request, response) {

    let filePath = '.' + request.url
    if (filePath == './') {
        filePath = './index.html'
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    }

    const contentType = mimeTypes[extname] || 'application/octet-stream'

    fs.readFile(filePath, function (error, content) {
        response.writeHead(200, { 'Content-Type': contentType })
        response.end(content, 'utf-8')
    })

}).listen(httpPort, () => {
    console.log(`Webserver running on http://localhost:${httpPort}/`)
    wsServer.startWsServer(8080)
})