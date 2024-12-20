import { SCHOOL_SITE } from '../shared/const.js';
import { HtmlHelper } from '../shared/html-helper.js';
import { ExtMessage } from '../shared/message.js';
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
    this.isChanged = false;
  }

  /**
   * Pin notification
   * @returns {Promise.<void>}
   */
  async pin() {
    this.isPinned = true;

    await ExtStorage.addPinnedNotification(this.href);
    await ExtMessage.send('PIN_NOTIFICATION', 'background', this.href);
  }

  /**
   * Unpin notification
   * @returns {Promise.<void>}
   */
  async unpin() {
    this.isPinned = false;

    await ExtStorage.removePinnedNotification(this.href);
    await ExtStorage.removeNotification(this.href);
    await ExtStorage.removeChangedNotification(this.href);
  }

  async open() {
    await ExtTab.create('SCHOOL_SITE', this.href);
    await ExtStorage.removeChangedNotification(this.href);
    await ExtMessage.send('CLICK_NOTIFICATION', 'background', this.href);
  }

  /**
   *
   * @param {HTMLTemplateElement} template
   * @param {() => void} onRefresh
   * @returns {HTMLTableRowElement}
   */
  toHtmlElement(template, onRefresh) {
    const element = /** @type {HTMLTableRowElement} */ (
      template.content.firstElementChild.cloneNode(true)
    );
    /** @type {HTMLAnchorElement} */
    const domItemLink = element.querySelector('.notification-item');
    /** @type {HTMLSpanElement} */
    const domNewTag = element.querySelector('.tag-new');
    /** @type {HTMLSpanElement} */
    const domChangedTag = element.querySelector('.tag-changed');
    /** @type {HTMLSpanElement} */
    const domItemDate = element.querySelector('.notification-date');
    /** @type {SVGElement} */
    const unpinnedBtn = element.querySelector('.pin-btn.unpinned');
    /** @type {SVGElement} */
    const pinnedBtn = element.querySelector('.pin-btn.pinned');

    // Update content
    domItemLink.textContent = this.title;
    domItemDate.textContent = this.date;

    if (this.isPinned) {
      HtmlHelper.displayGroup({
        display: [pinnedBtn],
        hide: [unpinnedBtn],
      });
    }

    if (this.isNew) {
      HtmlHelper.display(domNewTag);
    }

    // Only pinned notifications can be marked as changed
    if (this.isPinned && this.isChanged) {
      HtmlHelper.display(domChangedTag);
    }

    // Add event triggers
    domItemLink.addEventListener('click', () => this.open());

    unpinnedBtn.addEventListener('click', () => {
      // Show pinned icon and save to storage
      HtmlHelper.displayGroup({
        display: [pinnedBtn],
        hide: [unpinnedBtn],
      });

      this.pin();

      onRefresh();
    });

    pinnedBtn.addEventListener('click', () => {
      // Show unpinned icon and remove from storage
      HtmlHelper.displayGroup({
        display: [unpinnedBtn],
        hide: [pinnedBtn],
      });

      this.unpin();

      onRefresh();
    });

    return element;
  }

  /**
   * Get list of notifications from DOM NodeList
   * @param {NodeListOf<Element>} nodeList
   * @param {boolean} isRunFromBackground
   * @returns {Promise<Array<NeuNotification>>}
   */
  static async getListFromNodeList(nodeList, isRunFromBackground) {
    let idx = 0;
    /** @type {Array.<NeuNotification>} */
    const result = [];
    /** @type {Set.<string>} */
    const pinnedNotificationUrls = isRunFromBackground
      ? new Set()
      : await ExtStorage.getPinnedNotificationUrls();

    for (const node of nodeList) {
      /** @type {HTMLAnchorElement} */
      const aTag = node.querySelector('a');
      /** @type {HTMLElement} */
      const iTag = node.querySelector('i');

      const url = aTag.attributes['href'].value;
      const isPinned = pinnedNotificationUrls.has(url);

      result.push(
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

    return result;
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
      this.#notifications = await NeuNotification.getListFromNodeList(
        domNotificationElements,
        isRunFromBackground
      );
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
   * Mark notifications as new
   */
  async markNew() {
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
   * Mark notifications as changed
   */
  async markChanged() {
    const changedNotifications = await ExtStorage.getChangedNotifications();
    this.#notifications.forEach((n) => {
      if (changedNotifications.includes(n.href)) {
        n.isChanged = true;
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
      const element = notification.toHtmlElement(template, () => {
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
