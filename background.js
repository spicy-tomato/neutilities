import { NotificationFetcher } from './functions/fetch-notification.js';
import { ExtAlarm } from './shared/alarm.js';
import { ExtBadge } from './shared/badge.js';
import { ExtMessage } from './shared/message.js';
import { ExtOffscreen } from './shared/offscreen.js';
import { ExtStorage } from './shared/storage.js';

// #region job handlers

/**
 * Fetch all notifications' URL. If fetched data is different from cached data, then display badge `new`
 * @returns {Promise.<void>}
 */
async function handleCheckNewNotificationJob() {
  /** @type {Array.<string>} */
  const notifications = await ExtMessage.send(
    'CHECK_NEW_NOTIFICATION',
    'offscreen',
    {}
  );

  ExtStorage.updateLastFetchedAt(notifications);

  const newNotifications =
    await NotificationFetcher.getNewNotifications(notifications);

  if (newNotifications.length > 0) {
    await ExtBadge.setNew();
  }
}

/**
 * @returns {Promise.<void>}
 */
async function handleCheckRecentlyUpdateNotificationJob() {
  /** @type {Array.<{url: string, content: string}>} */
  const notifications = [];
  const pinnedNotificationUrls = await ExtStorage.getPinnedNotificationUrls();

  for (const url of pinnedNotificationUrls) {
    /** @type {string | null} */
    const content = await ExtMessage.send(
      'CHECK_RECENTLY_UPDATE_NOTIFICATION',
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

/**
 * @returns {Promise.<void>}
 */
async function handlePruneNotificationJob() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  await ExtStorage.pruneNotification(cutoffDate);
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
    'CHECK_RECENTLY_UPDATE_NOTIFICATION',
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
    'CHECK_NEW_NOTIFICATION_ALARM',
    { periodInMinutes: 0.5 },
    handleCheckNewNotificationJob
  ),
  alarm.add(
    'CHECK_NEW_UPDATE_NOTIFICATION_ALARM',
    { periodInMinutes: 0.5 },
    handleCheckRecentlyUpdateNotificationJob
  ),
  alarm.add(
    'PRUNE_NOTIFICATION_ALARM',
    { periodInMinutes: 30 },
    handlePruneNotificationJob
  ),
]).then(() => alarm.listen());

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== 'install') {
    await ExtStorage.clean();
  }
  try {
    await handleCheckNewNotificationJob();
  } catch (_) {
    setTimeout(handleCheckNewNotificationJob, 5000);
  }
});

ExtMessage.listenOnTarget('background', handleMessages, true);

ExtBadge.setup();
