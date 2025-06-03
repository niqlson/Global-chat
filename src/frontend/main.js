const input = document.getElementById('messageInput');
const chat = document.getElementById('chat');

class AsyncQueue {
  #futures = []
  #values = []

  put(value) {
    if (this.#futures.length > 0) {
      const future = this.#futures.shift();
      return void future(value);
    }
    this.#values.push(value);
  }

  get() {
    if (this.#values.length > 0) {
      return Promise.resolve(this.#values.shift());
    }
    return new Promise((resolve) => {
      this.#futures.push(resolve);
    });
  }

  [Symbol.asyncIterator]() {
    const next = async () => ({ value: await this.get(), done: false });
    return { next };
  }
}

class WebSocketTransport extends WebSocket {
  #id = 0
  #timeout = 0
  #futures = new Map();
  #values = new AsyncQueue()

  constructor(url, timeout = 5000) {
    super(url);
    this.#timeout = timeout;
    this.addEventListener('message', (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'response' && this.#futures.has(payload.id)) {
        const { resolve, timer } = this.#futures.get(payload.id);
        this.#futures.delete(payload.id);
        resolve(payload.data);
        return void clearTimeout(timer);
      }
      this.#values.put(payload.data);
    });
    return new Promise((resolve, reject) => {
      const onOpen = () => {
        this.removeEventListener('error', reject);
        resolve(this);
      };
      this.addEventListener('open', onOpen, { once: true });
      this.addEventListener('error', reject, { once: true });
    });
  }

  send(data) {
    const payload = { id: this.#id, data };
    super.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      const onTimeout = () => {
        reject(new Error('Response waiting time is up'));
        this.#futures.delete(this.#id);
      };
      const timer = setTimeout(onTimeout, this.#timeout);
      this.#futures.set(this.#id, { resolve, timer });
    });
  }

  [Symbol.asyncIterator]() {
    return this.#values[Symbol.asyncIterator]();
  }
}

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

(async () => {
  if (localStorage.getItem('id') === null) {
    localStorage.setItem('id', generateRandomKey());
  }
  
  const ws = await new WebSocketTransport('ws://127.0.0.1:8080');
  setInterval(async () => {
    const answer = await ws.send({ service: 'messages', method: 'get' });
    console.log({ answer });
  }, 1000);
})();