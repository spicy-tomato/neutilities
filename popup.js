import { NotificationFetcher } from './functions/fetch-notification.js';

document.addEventListener('DOMContentLoaded', async () => {
  const fetcher = new NotificationFetcher();

  await fetcher.fetch();
  fetcher.display();
  await fetcher.cache();
});
