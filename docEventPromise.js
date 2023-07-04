const CONSTANTS = {
  DEFAULT: {
    CANCELLABLE: false,
    EVENT: 'DOMContentLoaded',
    TIMEOUT: 5000,
  }
}

import debugWithColor from 'https://cdn.jsdelivr.net/gh/Demodia/common@3f580b10cd0d3cf93e5475883bd0f36954faa049/debugWithColor.min.js';


/**
 * Returns a Promise that resolves when a specific event on the document occurs.
 *
 * @param {Object} [options] - The options for the Promise.
 * @param {string} [options.event='DOMContentLoaded'] - The event to wait for.
 * @param {number} [options.timeout=5000] - The maximum time to wait for the event, in milliseconds.
 * @param {boolean} [options.cancellable=false] - Whether the Promise should be cancellable.
 * @returns {Promise} A Promise that resolves when the event occurs or the timeout expires.
 */
export default function docEventPromise({ event = CONSTANTS.DEFAULT.EVENT, timeout = CONSTANTS.DEFAULT.TIMEOUT, cancellable = CONSTANTS.DEFAULT.CANCELLABLE, debug = false } = {}) {
  let timer;
  let listener;

  const promise = new Promise((resolve, reject) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      resolve();
    } else {
      listener = () => {
        debug && console.log(...debugWithColor(['docEventPromise', event], ['lime', 'teal'], debug));
        resolve();
      };
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
