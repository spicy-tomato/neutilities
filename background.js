import { NotificationFetcher } from './functions/fetch-notification.js';
import { ExtAlarm } from './shared/alarm.js';
import { ExtBadge } from './shared/badge.js';
import { NotificationDb } from './shared/db/notification.db.js';
import { ExtMessage } from './shared/message.js';
import { ExtOffscreen } from './shared/offscreen.js';
import { StorageHelper } from './shared/storage/storage.helper.js';

const UPDATE_NOTIFICATION_BATCH = 5;

// #region job handlers

/**
 * Fetch all notifications' URL. If fetched data is different from cached data, then display badge `new`
 * @returns {Promise.<void>}
 */
async function handleCheckNewNotificationJob() {
  /** @type {Array<string>} */
  const notificationIds = await ExtMessage.send(
    'CHECK_NEW_NOTIFICATION',
    'offscreen',
    {}
  );

  const notificationDb = new NotificationDb();
  const currentTime = new Date().toISOString();

  await Promise.all(
    notificationIds.map((id) =>
      notificationDb.patch(id, { lastFetchedAt: currentTime })
    )
  );

  const newNotifications = await NotificationFetcher.getNewNotifications(
    notificationIds
  );

  if (newNotifications.length > 0) {
    await ExtBadge.setNew();
  }
}

/**
 * @returns {Promise.<void>}
 */
async function handleCheckRecentlyUpdateNotificationJob() {
  /** @type {Array<{url: string, data: string}>} */
  const crawledNotifications = [];
  const notificationDb = new NotificationDb();

  /** @type {Array<import('./shared/db/notification.db.js').DbNotification>} */
  const oldestFiveNotifications = await notificationDb.get({
    field: 'lastUpdatedAt',
    value: undefined,
    limit: UPDATE_NOTIFICATION_BATCH,
  });

  if (oldestFiveNotifications.length < UPDATE_NOTIFICATION_BATCH) {
    const itemsWithLastUpdatedAtCount =
      UPDATE_NOTIFICATION_BATCH - oldestFiveNotifications.length;
    oldestFiveNotifications.push(
      ...(await notificationDb.get({
        field: 'lastUpdatedAt',
        direction: 'next',
        limit: itemsWithLastUpdatedAtCount,
      }))
    );
  }

  for (const url of oldestFiveNotifications.map((n) => n.id)) {
    /** @type {string | null} */
    const data = await ExtMessage.send(
      'CHECK_RECENTLY_UPDATE_NOTIFICATION',
      'offscreen',
      url
    );
    if (!!data) {
      crawledNotifications.push({ url, data });
    }
  }

  if (crawledNotifications.length <= 0) {
    return;
  }

  let isNotificationsUpdated = false;

  for (const crawledNotification of crawledNotifications) {
    const savedNotification = oldestFiveNotifications.find(
      (n) => n.id === crawledNotification.url
    );

    if (!savedNotification || !savedNotification.data) {
      await notificationDb.patch(crawledNotification.url, {
        data: crawledNotification.data,
        lastUpdatedAt: new Date().toISOString(),
      });
    } else if (savedNotification.data === crawledNotification.data) {
      await notificationDb.patch(crawledNotification.url, {
        lastUpdatedAt: new Date().toISOString(),
      });
    } else {
      await notificationDb.patch(crawledNotification.url, {
        data: crawledNotification.data,
        isUpdated: true,
        lastUpdatedAt: new Date().toISOString(),
      });
      isNotificationsUpdated = true;
    }
  }

  if (isNotificationsUpdated) {
    await ExtBadge.setNew();
  }
}

/**
 * @returns {Promise.<void>}
 */
async function handlePruneNotificationJob() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  new NotificationDb().prune(cutoffDate);
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
    await new StorageHelper().clean('extension');
  }
  try {
    await handleCheckNewNotificationJob();
  } catch (_) {
    setTimeout(handleCheckNewNotificationJob, 5000);
  }
});

ExtBadge.setup();
