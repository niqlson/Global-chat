'use strict';

const ws = require('ws');
const config = require('./config.json');
const database = require('knex')(config.database);
const api = require('./api.js')(database);
const ProcesQueue = require('./ProcesQueue.js');

const options = { ...config.network, clientTracking: true };

const process = async ({ socket, rawData, wss }) => {
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
};

const main = async () => {
  const wss = new ws.WebSocketServer(options);
  const queue = new ProcesQueue(100, process);
  wss.on('connection', (socket) => {
    socket.on('message', async (rawData) => {
      await queue.add({ socket, rawData, wss });
    });
  });
};

main();
