'use strict';

const ws = require('ws');
const config = require('./config.json');
const database = require('knex')(config.database);
const ProcesQueue = require('./ProcesQueue.js');
const events = require('node:events');

const options = { ...config.network, clientTracking: true };

const ee = new events.EventEmitter();

const api = require('./api.js')(database, ee);

const process = async ({ socket, rawData }) => {
  const { id, service, method, data = {} } = JSON.parse(rawData.toString());
  const result = await api[service][method](data);
  const response = { data: result, id, type: 'response' };
  socket.send(JSON.stringify(response));
};

const main = async () => {
  const wss = new ws.WebSocketServer(options);
  const queue = new ProcesQueue(100, process);
  ee.on('message', (data) => {
    const message = { data, type: 'message' };
    const packet = JSON.stringify(message);
    for (const connection of wss.clients) {
      connection.send(packet);
    }
  });
  for await (const [socket] of events.on(wss, 'connection')) {
    for await (const [rawData] of events.on(socket, 'message')) {
      await queue.add({ socket, rawData });
    };
  }
};

main();
