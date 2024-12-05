/// <reference path="shared/message.js" />

import { NotificationFetcher } from './functions/fetch-notification.js';
import { ExtMessage } from './shared/message.js';

ExtMessage.listenOnTarget('offscreen', handleMessages);

/**
 *
 * @param {import('./shared/message.js').MessageModel} message
 * @param {chrome.runtime.MessageSender} _sender
 * @param {(response?: any) => void} sendResponse
 * @returns {void}
 */
function handleMessages(message, _sender, sendResponse) {
  console.log(message);
  if (message.target !== 'offscreen') {
    return;
  }

  switch (message.type) {
    case 'FETCH_NOTIFICATION':
      fetchNotification(sendResponse);
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
      return;
  }
}

/**
 *
 * @param {(response?: any) => void} sendResponse
 * @returns {void}
 */
function fetchNotification(sendResponse) {
  const fetcher = new NotificationFetcher();
  fetcher.fetch().then(() => {
    console.log(fetcher.latestNotificationUrl);
    sendResponse(fetcher.latestNotificationUrl);
  });
}
