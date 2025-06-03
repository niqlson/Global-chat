'use strict';

const ws = require('ws');
const config = require('./config.json');
const database = require('knex')(config.database);

const options = { ...config.network, clientTracking: true };

const main = async () => {
  const wss = new ws.WebSocketServer(options);
  wss.on('connection', (socket) => {
    let index = 0;
    socket.on('message', (data) => {
      const { id } = JSON.parse(data.toString());
      const result = [{ message: 'Hello world!', own: false, index: index++ }];
      const answer = { id, type: 'response', data: result };
      socket.send(JSON.stringify(answer));
    });
  });
};

main()
