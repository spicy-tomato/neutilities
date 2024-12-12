import { SCHOOL_SITE } from '../shared/const.js';
import { ExtStorage } from '../shared/storage.js';
import { ExtTab } from '../shared/tab.js';

export class NeuNotification {
  /**
   * Constructor
   * @param {number} idx - Index of notification
   * @param {string} title - Title of notification
   * @param {string} href - URL of notification
   * @param {string} dateStr - Published date of notification
   * @param {boolean} isPinned - Notification is pinned by user or not
   */
  constructor(idx, title, href, dateStr, isPinned) {
    this.idx = idx;
    this.title = title;
    this.href = href;
    this.isPinned = isPinned;
    this.date = dateStr.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ?? '';
    this.isoDate = this.date.split('/').reverse().join('-');
    this.isNew = false;
  }
}

export class NotificationFetcher {
  /** @type {Array.<NeuNotification>} */
  #notifications = [];

  get notifications() {
    return this.#notifications[Symbol.iterator]();
  }

  /**
   *
   * @param {Array.<string>} notifications
   * @returns {Promise.<Array<string>>}
   */
  static async getNewNotifications(notifications) {
    /** @type {Array.<string>} */
    const result = [];
    let endIdx = notifications.length - 1;

    const cachedNotifications = await ExtStorage.getNotificationsListCache();

    for (; endIdx >= 0; endIdx--) {
      if (cachedNotifications.includes(notifications[endIdx])) {
        break;
      }
    }

    // In case all notifications are not cached
    if (endIdx <= 0) {
      result.push(...notifications);
    } else {
      for (let i = 0; i < endIdx; i++) {
        const notification = notifications[i];
        if (!cachedNotifications.includes(notification)) {
          result.push(notification);
        }
      }
    }

    return result;
  }

  /**
   * Fetch all notifications from homepage site
   * @param {boolean} isRunFromBackground
   * @returns {Promise.<void>}
   */
  async fetch(isRunFromBackground = false) {
    try {
      const domNotificationElements = await this.#retrieveNotificationsDom();
      /** @type {Set.<string>} */
      const pinnedNotificationUrls = isRunFromBackground
        ? new Set()
        : await ExtStorage.getPinnedNotificationUrls();

      this.#notifications = [];
      let idx = 0;

      for (const notificationElement of domNotificationElements) {
        /** @type {HTMLAnchorElement} */
        const aTag = notificationElement.querySelector('a');
        /** @type {HTMLElement} */
        const iTag = notificationElement.querySelector('i');

        const url = aTag.attributes['href'].value;
        const isPinned = pinnedNotificationUrls.has(url);

        this.#notifications.push(
          new NeuNotification(
            idx,
            aTag.innerText.trim(),
            url,
            iTag.innerText,
            isPinned
          )
        );

        idx++;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  /**
   * Sort notifications order by descending date
   */
  sort() {
    this.#notifications.sort((a, b) => {
      if (a.isPinned && !b.isPinned) {
        return -1;
      }
      if (!a.isPinned && b.isPinned) {
        return 1;
      }
      if (a.isoDate !== b.isoDate) {
        return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
      }
      return a.idx - b.idx;
    });
  }

  /**
   * Sort notifications order by descending date
   */
  async markAsNew() {
    const newNotifications = await NotificationFetcher.getNewNotifications(
      this.#notifications.map((n) => n.href)
    );
    this.#notifications.forEach((n) => {
      if (newNotifications.includes(n.href)) {
        n.isNew = true;
      }
    });
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
      const domTag = element.querySelector('.tag');
      /** @type {HTMLSpanElement} */
      const domItemDate = element.querySelector('.notification-date');
      /** @type {SVGElement} */
      const unpinnedBtn = element.querySelector('.pin-btn.unpinned');
      /** @type {SVGElement} */
      const pinnedBtn = element.querySelector('.pin-btn.pinned');

      // Update content
      domItemLink.textContent = notification.title;
      domItemDate.textContent = notification.date;

      if (notification.isPinned) {
        unpinnedBtn.classList.add('hidden');
        pinnedBtn.classList.remove('hidden');
      }

      if (notification.isNew) {
        domTag.classList.remove('hidden');
      }

      // Add event triggers
      domItemLink.addEventListener('click', async () => {
        await ExtTab.create('SCHOOL_SITE', notification.href);
      });

      unpinnedBtn.addEventListener('click', async () => {
        // Show pinned icon and save to storage
        unpinnedBtn.classList.add('hidden');
        pinnedBtn.classList.remove('hidden');
        await ExtStorage.addPinnedNotification(notification.href);
        notification.isPinned = true;
        this.sort();
        this.display();
      });

      pinnedBtn.addEventListener('click', async () => {
        // Show unpinned icon and remove from storage
        pinnedBtn.classList.add('hidden');
        unpinnedBtn.classList.remove('hidden');
        await ExtStorage.removePinnedNotification(notification.href);
        notification.isPinned = false;
        this.sort();
        this.display();
      });

      elements.push(element);
    }

    const domTable = document.querySelector('.notification-table');

    domTable.textContent = '';
    domTable.append(...elements);
  }

  /**
   * Caching notifications
   * @returns {Promise.<void>}
   */
  async cache() {
    if (this.#notifications.length <= 0) {
      return;
    }

    await ExtStorage.setNotificationsListCache(
      this.#notifications.map((n) => n.href)
    );
  }

  /**
   * Retrieve notifications DOM
   * @returns {Promise.<NodeListOf<Element>>}
   */
  async #retrieveNotificationsDom() {
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

    return domNotificationElements;
  }
}
