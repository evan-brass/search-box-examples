export function queue() {
  let items = [];
  let waiting = [];
  return {
    append() {
      items.push(...arguments);
      const w = waiting;
      waiting = [];
      w.forEach(c => c());
    },
    async *[Symbol.asyncIterator]() {
      while (true) {
        if (items.length) {
          yield items.shift();
        } else {
          await this;
        }
      }
    },
    then(callback) {
      waiting.push(callback);
    }
  };
}

const upload_queue = queue();

// File drop:
drop_zone.ondrop = function (e) {
  e.preventDefault();

  upload_queue.append(...(e.dataTransfer.items ?? []));
};

// Uploader:
(async () => {
  for await (const item of upload_queue) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      await fetch(/* Upload the file */);
    }
  }
})();