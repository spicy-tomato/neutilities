import { SCHOOL_SITE } from '../shared/const.js';
import { ExtStorage } from '../shared/storage.js';
import { ExtTab } from '../shared/tab.js';

export class NeuNotification {
  /**
   * Constructor
   * @param {number} idx Index of notification
   * @param {string} title Title of notification
   * @param {string} href URL of notification
   * @param {string} date published date of notification
   * @param {string} isoDate published date of notification in ISO format
   */
  constructor(idx, title, href, date, isoDate) {
    this.idx = idx;
    this.title = title;
    this.href = href;
    this.date = date;
    this.isoDate = isoDate;
  }
}

export class NotificationFetcher {
  /** @type {Array.<NeuNotification>} */
  #notifications = [];

  get latestNotificationUrl() {
    return this.#notifications[0]?.href;
  }

  /**
   * Fetch all notifications from homepage site
   * @returns {Promise.<void>}
   */
  async fetch() {
    try {
      const response = await fetch(SCHOOL_SITE);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const pageContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, 'text/html');

      const domNotificationElements = doc.querySelectorAll(
        '.divmain > div:nth-child(2) > div'
      );

      this.#notifications = [];
      let idx = 0;

      for (const notificationElement of domNotificationElements) {
        /** @type {HTMLAnchorElement} */
        const aTag = notificationElement.querySelector('a');
        /** @type {HTMLElement} */
        const iTag = notificationElement.querySelector('i');

        const dateStr = iTag.innerText.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ?? '';
        const dateStrIso = dateStr.split('/').reverse().join('-');

        this.#notifications.push(
          new NeuNotification(
            idx,
            aTag.innerText,
            aTag.attributes['href'].value,
            dateStr,
            dateStrIso
          )
        );

        idx++;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  /**
   * Display to popup
   * @returns {void}
   */
  display() {
    const template = /** @type {HTMLTemplateElement} */ (
      document.getElementById('notification-item-template')
    );
    /** @type {Array.<HTMLTableRowElement>} */
    const elements = [];

    for (const notification of this.#notifications) {
      const element = /** @type {HTMLTableRowElement} */ (
        template.content.firstElementChild.cloneNode(true)
      );
      /** @type {HTMLAnchorElement} */
      const domItemLink = element.querySelector('.notification-item');
      /** @type {HTMLSpanElement} */
      const domItemDate = element.querySelector('.notification-date');
      /** @type {SVGElement} */
      const unpinnedBtn = element.querySelector('.pin-btn.pinned');
      /** @type {SVGElement} */
      const pinnedBtn = element.querySelector('.pin-btn.unpinned');

      domItemLink.textContent = notification.title;
      domItemDate.textContent = notification.date;

      domItemLink.addEventListener('click', async () => {
        await ExtTab.create('SCHOOL_SITE', notification.href);
      });

      elements.push(element);
    }

    document.querySelector('.notification-table').append(...elements);
  }

  /**
   * Caching notifications
   * @returns {Promise.<void>}
   */
  async cache() {
    if (this.#notifications.length <= 0) {
      return;
    }

    await ExtStorage.setNotificationsListCache(this.#notifications);
  }

  /**
   * Sort notifications order by descending date
   */
  sort() {
    this.#notifications.sort((a, b) => {
      if (a.isoDate !== b.isoDate) {
        return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
      }
      return a.idx - b.idx;
    });
  }
}
