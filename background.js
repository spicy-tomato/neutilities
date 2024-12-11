import { ExtAlarm } from './shared/alarm.js';
import { ExtBadge } from './shared/badge.js';
import { ExtMessage } from './shared/message.js';
import { ExtStorage } from './shared/storage.js';
import { ExtOffscreen } from './shared/offscreen.js';

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

  const postsLinkConcatenation = await ExtStorage.getPostsLinkConcatenation();
  if (!postsLinkConcatenation?.includes(latestNotificationUrl)) {
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
  { periodInMinutes: 0.5 },
  handleFetchNotificationJob
);

alarm.listen();
