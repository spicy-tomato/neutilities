const AvailableAlarmNames = {
  CHECK_NEW_NOTIFICATION_ALARM: 1,
  CHECK_NEW_UPDATE_NOTIFICATION_ALARM: 1,
  PRUNE_NOTIFICATION_ALARM: 1,
};

/** @typedef {keyof AvailableAlarmNames} AlarmName */

export class ExtAlarm {
  /** @type {Map.<string, Function>} */
  static #alarmsHandler = new Map();

  /**
   * Add new alarm
   * @param {AlarmName} name
   * @param {chrome.alarms.AlarmCreateInfo} alarmInfo
   * @param {Function} callback
   * @returns {Promise.<void>}
   */
  static async add(name, alarmInfo, callback) {
    await chrome.alarms.create(name, alarmInfo);
    this.#alarmsHandler.set(name, callback);
  }

  /**
   * Listen to all alarms
   * @returns {void}
   */
  static listen() {
    chrome.alarms.onAlarm.addListener((alarm) => {
      const handler = this.#alarmsHandler.get(alarm.name);
      if (!handler) {
        console.warn('No handler for alarm', alarm.name);
        return;
      }

      handler();
    });
  }

  /**
   * Clear all alarms
   * @returns {Promise<void>}
   */
  static async removeUnused() {
    const alarms = await chrome.alarms.getAll();

    alarms.forEach(({ name }) => {
      if (!Object.hasOwn(AvailableAlarmNames, name)) {
        console.info('Removed alarm', name);
        chrome.alarms.clear(name);
      }
    });
  }
}
