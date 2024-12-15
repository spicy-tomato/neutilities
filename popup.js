import { NotificationFetcher } from './functions/fetch-notification.js';
import { ExtBadge } from './shared/badge.js';

document.addEventListener('DOMContentLoaded', async () => {
  const fetcher = new NotificationFetcher();

  await fetcher.fetch();
  fetcher.sort();
  await fetcher.markNew();
  await fetcher.markChanged();
  fetcher.display();
  await fetcher.cache();

  await ExtBadge.clear();
});
