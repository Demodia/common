export default function docEventPromise({ event = 'DOMContentLoaded', timeout = 5000, cancellable = false } = {}) {
  let timer;
  let listener;

  const promise = new Promise((resolve, reject) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      resolve();
    } else {
      listener = resolve;
      document.addEventListener(event, listener, { once: true });

      if (timeout) {
        timer = setTimeout(() => {
          document.removeEventListener(event, listener);
          reject(new Error(`Document not ready after ${timeout}ms`));
        }, timeout);
      }
    }
  });

  if (cancellable) {
    return {
      promise,
      cancel: () => {
        clearTimeout(timer);
        document.removeEventListener(event, listener);
      },
    };
  }

  return promise;
}
