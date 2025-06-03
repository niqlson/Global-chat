'use strict';

import WebSocketTransport from "./WebSocketTransport.js";
import structure from "./structure.js";
import scaffold from "./scaffold.js";

const input = document.getElementById('messageInput');
const chat = document.getElementById('chat');

const putMessage = (message) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message my-message';
  messageDiv.textContent = message;
  chat.appendChild(messageDiv);
  };

const clearInput = () => {
  input.value = '';
  chat.scrollTop = chat.scrollHeight;
};

const insertMessage = (message) => {
  const text = message.trim();
  if (text.length === 0) return;
  putMessage(message);
  clearInput();
};

document.getElementById('sendButton').addEventListener('click', () => {
  insertMessage(input.value);
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') insertMessage(input.value);
});

const generateRandomKey = (bytes = 16) => {
  const random = crypto.getRandomValues(new Uint8Array(bytes));
  const hex = [...random].map((n) => n.toString(16).padStart(2, '0'));
  return hex.join('');
};

(async () => {
  const ws = await new WebSocketTransport('ws://127.0.0.1:8080');
  const api = scaffold(structure, ws);
  if (localStorage.getItem('id') === null) {
   const key = generateRandomKey();
    localStorage.setItem('id', key);
    api.users.create({ id: key });
  }
   setInterval(async () => {
    const answer = await api.messages.get();
    console.log({ answer });
  }, 1000);
})();
