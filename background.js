import { NotificationFetcher } from './functions/fetch-notification.js';
import { ExtAlarm } from './shared/alarm.js';
import { ExtBadge } from './shared/badge.js';
import { ExtMessage } from './shared/message.js';
import { ExtOffscreen } from './shared/offscreen.js';
import { ExtStorage } from './shared/storage.js';

/**
 * @returns {Promise.<void>}
 */
async function handleFetchNotificationJob() {
  const notifications = await ExtMessage.send(
    'FETCH_NOTIFICATION',
    'offscreen',
    {}
  );

  const newNotifications =
    await NotificationFetcher.getNewNotifications(notifications);

  if (newNotifications.length > 0) {
    await ExtBadge.setText('new');
  }
}

//////////////////////////////////////////////////

ExtOffscreen.createDocument(
  'offscreen.html',
  chrome.offscreen.Reason.DOM_PARSER,
  'Fetching notifications from NEU homepage site'
);

const alarm = new ExtAlarm();

alarm.add(
  'FETCH_NOTIFICATION_ALARM',
  { periodInMinutes: 5 },
  handleFetchNotificationJob
);

alarm.listen();

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
