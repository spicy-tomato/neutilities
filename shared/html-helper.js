export class HtmlHelper {
  static #hiddenClass = 'hidden';
  static #activeClass = 'hidden';

  //#region Display and hide

  /**
   * Display element by removing class `hidden`
   * @param {Element} element
   */
  static display(element) {
    this.#removeClass(element, this.#hiddenClass);
  }

  /**
   * Hide element by adding class `hidden`
   * @param {Element} element
   */
  static hide(element) {
    this.#addClass(element, this.#hiddenClass);
  }

  /**
   * Toggle display and hide for multiple elements
   * @param {Object} group
   * @param {Array.<Element>} group.display
   * @param {Array.<Element>} group.hide
   */
  static displayGroup(group) {
    group.display.forEach((e) => this.display(e));
    group.hide.forEach((e) => this.hide(e));
  }

  /**
   * Display element at index `index` and hide the rest
   * @param {number} index
   * @param {Array.<Element>} elements
   */
  static displayFromArray(index, elements) {
    const element = elements[index];
    if (!element) {
      console.warn(`Got falsy value at index ${index}`);
      return;
    }

    this.displayGroup({
      display: [element],
      hide: elements.filter((_, idx) => idx !== index),
    });
  }

  /**
   * Toggle display two groups by condition
   * @param {boolean} condition
   * @param {Array.<Array<Element>>} groups
   */
  static displayByCondition(condition, groups) {
    if (groups.length !== 2) {
      console.warn(`'groups.length' must be 2`);
      return;
    }

    if (condition) {
      this.displayGroup({
        display: groups[0],
        hide: groups[1],
      });
    } else {
      this.displayGroup({
        display: groups[1],
        hide: groups[0],
      });
    }
  }

  //#endregion

  //#region Activation

  /**
   *
   * Activate element by adding class `active`
   * @param {Element} element
   */
  static activate(element) {
    this.#removeClass(element, this.#activeClass);
  }

  /**
   * Deactivate element by removing class `active`
   * @param {Element} element
   */
  static deactivate(element) {
    this.#addClass(element, this.#activeClass);
  }

  //#endregion

  /**
   * Add class to element
   * @param {Element} element
   * @param {string} elementClass
   */
  static #addClass(element, elementClass) {
    element.classList.add(elementClass);
  }

  /**
   * Remove class from element
   * @param {Element} element
   * @param {string} elementClass
   */
  static #removeClass(element, elementClass) {
    element.classList.remove(elementClass);
  }
}
