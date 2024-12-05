import { NotificationFetcher } from './functions/fetch-notification.js';

document.addEventListener('DOMContentLoaded', async () => {
  const fetcher = new NotificationFetcher();

  await fetcher.fetch();
  fetcher.display();
  await fetcher.cache();

  // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //   if (tabs.length <= 0) {
  //     console.log('No tab active found.');
  //     return;
  //   }

  //   const activeTab = tabs[0];
  //   chrome.scripting.executeScript(
  //     {
  //       target: { tabId: activeTab.id },
  //       files: ['content.js'],
  //     },
  //     async () => {
  //       const notifications = await fetchNotifications();
  //       displayNotification(notifications);
  //     }
  //   );
  // });
});
