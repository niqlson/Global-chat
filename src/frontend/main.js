'use strict';

const input = document.getElementById('messageInput');
const chat = document.getElementById('chat');

const insertMessage = (message) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message my-message';
  messageDiv.textContent = message;
  chat.appendChild(messageDiv);
};

const clearInput = () => {
  input.value = '';
  chat.scrollTop = chat.scrollHeight;
};

const sendMessage = (message) => {
  const text = message.trim();
  if (text.length === 0) return;
  insertMessage(message);
  clearInput();
};

document.getElementById('sendButton').addEventListener('click', () => {
  sendMessage(input.value);
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') sendMessage(input.value);
});
