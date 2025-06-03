'use strict';

const ws = require('ws');
const config = require('./config.json');
const database = require('knex')(config.database);
const api = require('./api.js')(database);

const options = { ...config.network, clientTracking: true };

const main = async () => {
  const wss = new ws.WebSocketServer(options);
  wss.on('connection', (socket) => {
    socket.on('message', async (rawData) => {
      const { id, service, method, data = {} } = JSON.parse(rawData.toString());
      const result = await api[service][method](data);
      const response = { data: result, id, type: 'response' };
      socket.send(JSON.stringify(response));

      if (service === 'messages' && method === 'create' && result.success) {
        const message = { data: result.data, type: 'message' };
        const packet = JSON.stringify(message);
        for (const connection of wss.clients) {
          connection.send(packet);
        }
      }
    });
  });
};

main();
