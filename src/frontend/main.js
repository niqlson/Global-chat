const input = document.getElementById('messageInput');
const chat = document.getElementById('chat');

const putMessage = (message) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message my-message';
  messageDiv.textContent = message;
const clearInput = () => {
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

const generateRandomKey = (length = 16) => {
  const random = crypto.getRandomValues(new Uint8Array(length));
  const hex = [...random].map((n) => n.toString(16).padStart(2, '0'));
  return hex.join('');
};

(() => {
  if (localStorage.getItem('id') !== null) return;
  localStorage.setItem('id', generateRandomKey());
})();