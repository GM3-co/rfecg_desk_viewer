// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let remote = require('electron').remote;  
let net = require('net');
let tcpServer = net.createServer({ allowHalfOpen: true });
tcpServer.on('connection', (connection) => {
    connection.on('connect', () => {});
    connection.on('data', (data) => {
        dataStore(data.toString());
    });
});

tcpServer.listen(remote.getGlobal('port'));
