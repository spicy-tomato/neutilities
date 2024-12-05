const MessageTypeValues = {
  FETCH_NOTIFICATION: 1,
};

const MessageTargetValues = {
  offscreen: 1,
  background: 2,
};

/**
 * @typedef {keyof MessageTypeValues} MessageType
 */

/**
 * @typedef {keyof MessageTargetValues} MessageTarget
 */

/**
 * @typedef {Object} MessageModel
 * @property {MessageType} type
 * @property {MessageTarget} target
 * @property {*} data
 */

export class ExtMessage {
  /**
   * Send message via Chrome Message API
   * @param {MessageType} type
   * @param {MessageTarget} target
   * @param {*} data
   * @returns {Promise.<*>}
   */
  static async send(type, target, data) {
    return chrome.runtime.sendMessage({
      type,
      target,
      data,
    });
  }

  /**
   * Listen to target via Chrome Message API
   * @param {MessageTarget} target
   * @param {(message: MessageSender, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void} callback
   */
  static async listenOnTarget(target, callback) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.target !== target) {
        return;
      }

      callback(message, sender, sendResponse);
    });
  }
}
