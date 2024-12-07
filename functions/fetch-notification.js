import { SCHOOL_SITE } from '../shared/const.js';
import { ExtStorage } from '../shared/storage.js';

class NeuNotification {
  /**
   * Constructor
   * @param {string} title Title of notification
   * @param {string} href URL of notification
   * @param {string} date published date of notification
   */
  constructor(title, href, date) {
    this.title = title;
    this.href = href;
    this.date = date;
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

      if (domNotificationElements.length <= 0) {
        domNotificationElements.innerText = 'No notifications found.';
        return;
      }

      this.#notifications = [];

      for (const notificationElement of domNotificationElements) {
        const aTag = notificationElement.querySelector('a');
        const iTag = notificationElement.querySelector('i');

        const date = iTag.innerText.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ?? '';

        this.#notifications.push(
          new NeuNotification(aTag.innerText, aTag.attributes.href.value, date)
        );
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
    /** @type {HTMLElement} */
    const template = document.getElementById('notification-item-template');
    let elements = [];

    for (const notification of this.#notifications) {
      const element = template.content.firstElementChild.cloneNode(true);
      const domItemLink = element.querySelector('.notification-item');
      const domItemDate = element.querySelector('.notification-date');

      domItemLink.textContent = notification.title;
      domItemDate.textContent = notification.date;

      domItemLink.addEventListener('click', () => {
        chrome.tabs.create({
          url: SCHOOL_SITE + notification.href,
        });
      });

      elements.push(element);
    }

    document.querySelector('.notification-table').append(...elements);
  }

  /**
   *
   */
  async cache() {
    if (this.#notifications.length <= 0) {
      return;
    }

    const latestNotification = this.#notifications[0];
    ExtStorage.setLatestNotification(latestNotification.href);
  }
}
