'use strict';

class ProcessQueue {
  constructor(channels, process) {
    this.channels = channels;
    this.process = process;
    this.active = 0;
    this.waiting = [];
  }

  add(task) {
    return new Promise((resolve, reject) => {
      if (this.active >= this.channels) {
        return void this.waiting.push({ task, resolve, reject });
      }
      this.compute(task, resolve, reject);
    });
  }

  compute(task, resolve, reject) {
    this.active++;
    this.process(task).then((data) => {
      this.active--;
      if (this.waiting.length > 0 && this.active < this.channels) {
        const { task, resolve, reject } = this.waiting.shift();
        return void this.compute(task, resolve, reject);
      }
      resolve(data);
    }).catch(reject);
  }
}

module.exports = ProcessQueue;
