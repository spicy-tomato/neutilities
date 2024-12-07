import { ExtAlarm } from './shared/alarm.js';
import { ExtBadge } from './shared/badge.js';
import { ExtMessage } from './shared/message.js';
import { ExtStorage } from './shared/storage.js';

/**
 * @returns {Promise.<void>}
 */
async function handleFetchNotificationJob() {
  /** @type string */
  const latestNotificationUrl = await ExtMessage.send(
    'FETCH_NOTIFICATION',
    'offscreen',
    {}
  );

  const cachedLatestNotification = await ExtStorage.getLatestNotification();

  if (latestNotificationUrl != cachedLatestNotification) {
    await ExtBadge.setText('new');
  }
}

//////////////////////////////////////////////////

chrome.offscreen.createDocument({
  url: chrome.runtime.getURL('offscreen.html'),
  reasons: [chrome.offscreen.Reason.DOM_PARSER],
  justification: 'Fetching notification from NEU homepage site',
});

const alarm = new ExtAlarm();

alarm.add(
  'FETCH_NOTIFICATION_ALARM',
  { periodInMinutes: 0.5 },
  handleFetchNotificationJob
);

alarm.listen();
