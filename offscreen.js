import { NotificationDetailsFetcher } from './functions/fetch-notification-details.js';
import { NotificationFetcher } from './functions/fetch-notification.js';
import { ExtMessage } from './shared/message.js';

/**
 *
 * @param {import('./shared/message.js').MessageModel} message
 * @param {chrome.runtime.MessageSender} _sender
 * @param {(response?: any) => void} sendResponse
 * @returns {Promise.<void>}
 */
async function handleMessages(message, _sender, sendResponse) {
  if (message.target !== 'offscreen') {
    return;
  }

  switch (message.type) {
    case 'FETCH_ALL_NOTIFICATIONS':
      await fetchNotifications(sendResponse);
      break;
    case 'FETCH_NOTIFICATION_DETAILS':
      await fetchNotificationDetails(message.data, sendResponse);
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
      return;
  }
}

/**
 *
 * @param {(response?: any) => void} sendResponse
 * @returns {Promise.<void>}
 */
async function fetchNotifications(sendResponse) {
  const fetcher = new NotificationFetcher();
  await fetcher.fetch(true);
  const notificationUrls = Array.from(fetcher.notifications).map((n) => n.href);
  sendResponse(notificationUrls);
}

/**
 *
 * @param {string} notificationUrl
 * @param {(response?: any) => void} sendResponse
 * @returns {Promise.<void>}
 */
async function fetchNotificationDetails(notificationUrl, sendResponse) {
  const fetcher = new NotificationDetailsFetcher();
  const content = await fetcher.fetchAndMinify(notificationUrl);
  sendResponse(content);
}

//////////////////////////////////////////////////

ExtMessage.listenOnTarget('offscreen', handleMessages, true);
