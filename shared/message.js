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
   *
   * @overload
   * @param {MessageType} type
   * @param {MessageTarget} target
   * @param {*} data
   * @returns {Promise.<*>}
   */ /**
   * @overload
   * @param {'FETCH_NOTIFICATION'} type
   * @param {MessageTarget} target
   * @param {*} data
   * @returns {Promise.<Array<string>>}
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
   * @param {(message: MessageModel, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void} callback
   * @param {boolean} isAsync
   */
  static async listenOnTarget(target, callback, isAsync) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.target !== target) {
        return false;
      }

      callback(message, sender, sendResponse);

      return isAsync;
    });
  }
}
