'use strict';

import WebSocketTransport from './WebSocketTransport.js';
import structure from './structure.js';
import scaffold from './scaffold.js';

const input = document.getElementById('messageInput');
const chat = document.getElementById('chat');
const sendButton = document.getElementById('sendButton');

const ws = await new WebSocketTransport('ws://192.168.31.66:8080');
const api = scaffold(structure, ws);

const putMessage = (message, isOwn) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isOwn ? 'my-message' : 'other-message'}`;
  messageDiv.textContent = message;
  chat.appendChild(messageDiv);
};

sendButton.addEventListener('click', () => {
  const message = input.value.trim();
  if (message.length === 0) return;
  const userId = localStorage.getItem('id');
  api.messages.create({ userId, message });
  input.value = '';
});

input.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  sendButton.dispatchEvent(new CustomEvent('click'));
});

const generateRandomKey = (bytes = 16) => {
  const random = crypto.getRandomValues(new Uint8Array(bytes));
  const hex = [...random].map((n) => n.toString(16).padStart(2, '0'));
  return hex.join('');
};

(async () => {
  if (localStorage.getItem('id') === null) {
    const key = generateRandomKey();
    localStorage.setItem('id', key);
    await api.users.create({ id: key });
  }
  const id = localStorage.getItem('id');
  const { data: messages } = await api.messages.get();
  for (const { message, userId } of messages) {
    putMessage(message, Object.is(id, userId));
    chat.scrollTop = chat.scrollHeight;
  }
  for await (const { message, userId } of ws) {
    putMessage(message, Object.is(id, userId));
    chat.scrollTop = chat.scrollHeight;
  }
})();
