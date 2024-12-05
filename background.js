import {
  FETCH_NOTIFICATION_ALARM,
  FETCH_NOTIFICATION_PERIOD,
} from './shared/const.js';
import { ExtMessage } from './shared/message.js';
import { ExtStorage } from './shared/storage.js';

chrome.offscreen.createDocument({
  url: chrome.runtime.getURL('offscreen.html'),
  reasons: [chrome.offscreen.Reason.DOM_PARSER],
  justification: 'testing the offscreen API',
});

chrome.alarms.create(FETCH_NOTIFICATION_ALARM, {
  periodInMinutes: FETCH_NOTIFICATION_PERIOD,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === FETCH_NOTIFICATION_ALARM) {
    handleFetchNotificationJob();
  }
});

/**
 * @returns {void}
 */
function handleFetchNotificationJob() {
  /** @type string */
  ExtMessage.send('FETCH_NOTIFICATION', 'offscreen', {}).then(
    (latestNotificationUrl) => {
      console.log('latestNotificationUrl', latestNotificationUrl);
      ExtStorage.setLatestNotification(latestNotificationUrl);
    }
  );
}
