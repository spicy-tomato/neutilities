import { NotificationFetcher } from './functions/fetch-notification.js';
import { ExtBadge } from './shared/badge.js';
import { ExtStorage } from './shared/storage.js';

function addEventTriggers() {
  /** @type {SVGElement} */
  const resetBtn = document.querySelector('.btn-reset');

  resetBtn.addEventListener('click', async () => {
    await ExtStorage.clear();
    await ExtBadge.clear();
    fetch();
  });
}

function fetch() {
  const fetcher = new NotificationFetcher();

  fetcher.fetch().then(async () => {
    fetcher.sort();
    await fetcher.markNew();
    await fetcher.markChanged();
    fetcher.display();
    await fetcher.cache();
  });
}

//////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', async () => {
  addEventTriggers();

  fetch();

  await ExtBadge.clear();
});
