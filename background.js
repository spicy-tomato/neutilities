import { NotificationFetcher } from './functions/fetch-notification.js';
import { ExtAlarm } from './shared/alarm.js';
import { ExtBadge } from './shared/badge.js';
import { ExtMessage } from './shared/message.js';
import { ExtOffscreen } from './shared/offscreen.js';
import { ExtStorage } from './shared/storage.js';

// #region job handlers

/**
 * @returns {Promise.<void>}
 */
async function handleFetchNotificationJob() {
  /** @type {Array.<string>} */
  const notifications = await ExtMessage.send(
    'FETCH_ALL_NOTIFICATIONS',
    'offscreen',
    {}
  );

  const newNotifications =
    await NotificationFetcher.getNewNotifications(notifications);

  if (newNotifications.length > 0) {
    await ExtBadge.setNew();
  }
}

/**
 * @returns {Promise.<void>}
 */
async function handleFetchNotificationDetailsJob() {
  /** @type {Array.<{url: string, content: string}>} */
  const notifications = [];
  const pinnedNotificationUrls = await ExtStorage.getPinnedNotificationUrls();

  for (const url of pinnedNotificationUrls) {
    /** @type {string | null} */
    const content = await ExtMessage.send(
      'FETCH_NOTIFICATION_DETAILS',
      'offscreen',
      url
    );
    if (!!content) {
      notifications.push({ url, content });
    }
  }

  if (notifications.length <= 0) {
    return;
  }

  /** @type {Array.<string>} */
  const changedNotifications = [];
  const savedNotifications = await ExtStorage.getSavedNotifications();

  for (const notification of notifications) {
    if (
      savedNotifications.has(notification.url) &&
      savedNotifications.get(notification.url) !== notification.content
    ) {
      changedNotifications.push(notification.url);
    }
  }

  if (changedNotifications.length <= 0) {
    return;
  }

  await ExtStorage.setChangedNotifications(changedNotifications);
  await ExtBadge.setNew();
}

// #endregion

// #region message handlers

/**
 * @param {string} url
 * @returns {Promise.<void>}
 */
async function saveNotificationContent(url) {
  /** @type {string | null} */
  const content = await ExtMessage.send(
    'FETCH_NOTIFICATION_DETAILS',
    'offscreen',
    url
  );

  await ExtStorage.saveNotification(url, content ?? '');
}

/**
 *
 * @param {import('./shared/message.js').MessageModel} message
 * @param {chrome.runtime.MessageSender} _sender
 * @returns {Promise.<void>}
 */
async function handleMessages(message, _sender) {
  if (message.target !== 'background') {
    return;
  }

  switch (message.type) {
    case 'PIN_NOTIFICATION':
    case 'CLICK_NOTIFICATION':
      await saveNotificationContent(message.data);
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
      return;
  }
}

// #endregion

//////////////////////////////////////////////////

ExtOffscreen.createDocument(
  'offscreen.html',
  chrome.offscreen.Reason.DOM_PARSER,
  'Fetching notifications from NEU homepage site'
);

const alarm = new ExtAlarm();

Promise.all([
  alarm.add(
    'FETCH_NOTIFICATION_ALARM',
    { periodInMinutes: 0.5 },
    handleFetchNotificationJob
  ),
  alarm.add(
    'FETCH_NOTIFICATION_DETAILS_ALARM',
    { periodInMinutes: 0.5 },
    handleFetchNotificationDetailsJob
  ),
]).then(() => alarm.listen());

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== 'install') {
    await ExtStorage.clean();
  }
  try {
    await handleFetchNotificationJob();
  } catch (_) {
    setTimeout(handleFetchNotificationJob, 5000);
  }
});

ExtMessage.listenOnTarget('background', handleMessages, true);

ExtBadge.setup();
