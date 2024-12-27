import { NotificationFetcher } from './functions/fetch-notification.js';
import { ExtBadge } from './shared/badge.js';
import { HtmlHelper } from './shared/helpers/html-helper.js';
import { StorageHelper } from './shared/storage/storage.helper.js';

function addEventTriggers() {
  /** @type {SVGElement | null} */
  const resetBtn = document.querySelector('.btn-reset');
  /** @type {NodeListOf<HTMLDivElement>} */
  const tabs = document.querySelectorAll('.tab');
  /** @type {NodeListOf<HTMLDivElement>} */
  const tabItems = document.querySelectorAll('.tab-item');

  resetBtn?.addEventListener('click', async () => {
    await new StorageHelper().clear();
    await ExtBadge.clear();
    fetch();
  });

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      HtmlHelper.displayFromArray(idx, [...tabItems]);
      HtmlHelper.activateFromArray(idx, [...tabs]);
    });
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
