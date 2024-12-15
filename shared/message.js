const MessageTypeValues = {
  FETCH_ALL_NOTIFICATIONS: 1,
  FETCH_NOTIFICATION_DETAILS: 2,
  PIN_NOTIFICATION: 3,
  CLICK_NOTIFICATION: 4,
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
   * @param {'FETCH_ALL_NOTIFICATIONS'} type
   * @param {'offscreen'} target
   * @param {object} data
   * @returns {Promise.<Array<string>>}
   */ /**
   * @overload
   * @param {'FETCH_NOTIFICATION_DETAILS'} type
   * @param {'offscreen'} target
   * @param {string} data
   * @returns {Promise.<string>}
   */ /**
   * @overload
   * @param {'PIN_NOTIFICATION'} type
   * @param {'background'} target
   * @param {string} data
   * @returns {Promise.<void>}
   */ /**
   * @overload
   * @param {'CLICK_NOTIFICATION'} type
   * @param {'background'} target
   * @param {string} data
   * @returns {Promise.<void>}
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
