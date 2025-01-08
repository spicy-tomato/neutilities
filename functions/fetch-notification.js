import { SCHOOL_SITE } from '../shared/const.js';
import { NotificationDb } from '../shared/db/notification.db.js';
import { HtmlHelper } from '../shared/helpers/html-helper.js';
import { ExtMessage } from '../shared/message.js';
import { ListStorage } from '../shared/storage/list.storage.js';
import { PinStorage } from '../shared/storage/pin.storage.js';
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

    await new PinStorage().add(this.href);

    await ExtMessage.send('PIN_NOTIFICATION', 'background', this.href);
  }

  /**
   * Unpin notification
   * @returns {Promise.<void>}
   */
  async unpin() {
    this.isPinned = false;

    await new PinStorage().removePinnedNotification(this.href);
    await new NotificationDb().remove(this.href);
  }

  async open() {
    await ExtTab.openExternal('SCHOOL_SITE', this.href);
    await ExtMessage.send('CLICK_NOTIFICATION', 'background', this.href);
  }

  /**
   *
   * @param {HTMLTemplateElement} template
   * @param {() => void} onRefresh
   * @returns {HTMLTableRowElement | null}
   */
  toHtmlElement(template, onRefresh) {
    const row = /** @type {HTMLTableRowElement | null} */ (
      template.content.firstElementChild?.cloneNode(true)
    );

    if (row) {
      this.#renderCommonContent(row);

      this.#renderUiForPinFunction(row, onRefresh);

      this.#renderUiForOfflineFunction(row);

      return row;
    }

    return null;
  }

  /**
   * Get list of notifications from DOM NodeList
   * @param {NodeListOf<Element>} nodeList
   * @param {boolean} isRunFromBackground
   * @returns {Promise<Array<NeuNotification>>}
   */
  static async getListFromNodeList(nodeList, isRunFromBackground) {
    let idx = 0;
    /** @type {Array<NeuNotification>} */
    const result = [];
    /** @type {Set.<string>} */
    const pinnedNotificationUrls = isRunFromBackground
      ? new Set()
      : await new PinStorage().get();

    for (const node of nodeList) {
      /** @type {HTMLAnchorElement | null} */
      const aTag = node.querySelector('a');
      /** @type {HTMLElement | null} */
      const iTag = node.querySelector('i');

      const title = aTag?.innerText.trim() ?? '';
      const url = aTag?.attributes.getNamedItem('href')?.value ?? '';
      const dateStr = iTag?.innerText ?? '';
      const isPinned = !!url && pinnedNotificationUrls.has(url);

      result.push(new NeuNotification(idx, title, url, dateStr, isPinned));

      idx++;
    }

    return result;
  }

  /**
   *
   * @param {HTMLTableRowElement} row
   * @param {() => void} onRefresh
   */
  #renderUiForPinFunction(row, onRefresh) {
    /** @type {HTMLSpanElement | null} */
    const domChangedTag = row.querySelector('.tag-changed');
    /** @type {SVGElement | null} */
    const unpinnedBtn = row.querySelector('.pin-btn.unpinned');
    /** @type {SVGElement | null} */
    const pinnedBtn = row.querySelector('.pin-btn.pinned');

    // Update content
    if (pinnedBtn && unpinnedBtn) {
      HtmlHelper.displayByCondition(this.isPinned, [
        [pinnedBtn],
        [unpinnedBtn],
      ]);
    }

    if (!this.isNew && this.isChanged && domChangedTag) {
      HtmlHelper.display(domChangedTag);
    }

    if (pinnedBtn && unpinnedBtn) {
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
    }
  }

  /**
   *
   * @param {HTMLTableRowElement} row
   */
  #renderUiForOfflineFunction(row) {
    /** @type {SVGElement | null} */
    const offlineBtn = row.querySelector('.offline-btn');

    if (offlineBtn) {
      new NotificationDb().getById(this.href).then((notification) => {
        if (notification?.data) {
          HtmlHelper.display(offlineBtn);

          offlineBtn.addEventListener('click', () => {
            ExtTab.openWithContent(/** @type {string} */ (notification.data));
          });
        }
      });
    }
  }

  /**
   *
   * @param {HTMLTableRowElement} row
   */
  #renderCommonContent(row) {
    /** @type {HTMLAnchorElement | null} */
    const domItemLink = row.querySelector('.notification-item');
    /** @type {HTMLSpanElement | null} */
    const domNewTag = row.querySelector('.tag-new');
    /** @type {HTMLSpanElement | null} */
    const domItemDate = row.querySelector('.notification-date');

    // Update content
    if (domItemLink) {
      domItemLink.textContent = this.title;
    }
    if (domItemDate) {
      domItemDate.textContent = this.date;
    }

    if (this.isNew && domNewTag) {
      HtmlHelper.display(domNewTag);
    }

    // Add event triggers
    domItemLink?.addEventListener('click', () => this.open());
  }
}

export class NotificationFetcher {
  /** @type {Array<NeuNotification>} */
  #notifications = [];

  get notifications() {
    return this.#notifications[Symbol.iterator]();
  }

  /**
   *
   * @param {Array<string>} notifications
   * @returns {Promise.<Array<string>>}
   */
  static async getNewNotifications(notifications) {
    /** @type {Array<string>} */
    const result = [];
    let endIdx = notifications.length - 1;

    const listStorage = new ListStorage();

    const cachedNotifications = await listStorage.get();

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
    const changedNotificationIds = (
      await new NotificationDb().get({ field: 'isUpdated', value: 1 })
    ).map((n) => n.id);

    // const changedNotifications = await new ChangedStorage().get();
    this.#notifications.forEach((n) => {
      if (changedNotificationIds.includes(n.href)) {
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
    /** @type {Array<HTMLTableRowElement>} */
    const elements = [];

    for (const notification of this.#notifications) {
      const element = notification.toHtmlElement(template, () => {
        this.sort();
        this.display();
      });

      if (element) {
        elements.push(element);
      }
    }

    const domTable = document.querySelector('.notification-table');

    if (domTable) {
      domTable.textContent = '';
      domTable.append(...elements);
    }
  }

  /**
   * Caching notifications
   * @returns {Promise.<void>}
   */
  async cache() {
    if (this.#notifications.length <= 0) {
      return;
    }

    const notificationUrls = this.#notifications.map((n) => n.href);

    const listStorage = new ListStorage();
    const notificationDb = new NotificationDb();
    const currentTime = new Date().toISOString();

    const updateNotificationPromises = notificationUrls.map((url) =>
      notificationDb.patch(url, {
        lastFetchedAt: currentTime,
        isUpdated: 0,
      })
    );

    await Promise.all([
      listStorage.set(notificationUrls),
      ...updateNotificationPromises,
    ]);
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
