export class ExtAlarm {
  /** @type Map.<string, Function> */
  #alarmsHandler = new Map();

  /**
   * Add new alarm
   * @param {string} name
   * @param {chrome.alarms.AlarmCreateInfo} alarmInfo
   * @param {Function} callback
   * @returns {Promise.<void>}
   */
  async add(name, alarmInfo, callback) {
    await chrome.alarms.create(name, alarmInfo);
    this.#alarmsHandler.set(name, callback);
  }

  /**
   * Listen to all alarms
   * @returns {void}
   */
  listen() {
    chrome.alarms.onAlarm.addListener((alarm) => {
      const handler = this.#alarmsHandler.get(alarm.name);
      if (!handler) {
        console.warn('No handler for alarm', alarm.name);
        return;
      }

      handler();
    });
  }
}
