import {
  FETCH_NOTIFICATION_ALARM,
  FETCH_NOTIFICATION_PERIOD,
} from './shared/const.js';
import { ExtMessage } from './shared/message.js';
import { ExtStorage } from './shared/storage.js';

chrome.offscreen.createDocument({
  url: chrome.runtime.getURL('offscreen.html'),
  reasons: [chrome.offscreen.Reason.DOM_PARSER],
  justification: 'Fetching notification from NEU homepage site',
});

chrome.alarms.create(FETCH_NOTIFICATION_ALARM, {
  periodInMinutes: FETCH_NOTIFICATION_PERIOD,
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === FETCH_NOTIFICATION_ALARM) {
    await handleFetchNotificationJob();
  }
});

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
  await ExtStorage.setLatestNotification(latestNotificationUrl);
}
