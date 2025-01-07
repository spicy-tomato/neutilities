import { NotificationFetcher } from './functions/fetch-notification.js';
import { ExtBadge } from './shared/badge.js';
import { HtmlHelper } from './shared/helpers/html-helper.js';
import { StorageHelper } from './shared/storage/storage.helper.js';
import { ExtTab } from './shared/tab.js';

function addEventTriggers() {
  /** @type {SVGElement | null} */
  const homeBtn = document.querySelector('.btn-home');
  /** @type {SVGElement | null} */
  const extensionBtn = document.querySelector('.btn-extension');
  /** @type {SVGElement | null} */
  const githubBtn = document.querySelector('.btn-github');
  /** @type {SVGElement | null} */
  const resetBtn = document.querySelector('.btn-reset');
  /** @type {NodeListOf<HTMLDivElement>} */
  const tabs = document.querySelectorAll('.tab');
  /** @type {NodeListOf<HTMLDivElement>} */
  const tabItems = document.querySelectorAll('.tab-item');

  homeBtn?.addEventListener('click', async () => {
    ExtTab.create('SCHOOL_SITE');
  });

  extensionBtn?.addEventListener('click', async () => {
    ExtTab.create('EXTENSION_URL');
  });

  githubBtn?.addEventListener('click', async () => {
    ExtTab.create('REPOSITORY_URL');
  });

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
