/**
 * @typedef {Object} NodeAttributeProps
 * @property {string} name - The name of the attribute.
 * @property {string} value - The value of the attribute.
 */

/**
 * Class representing a node attribute.
 */
export class NodeAttribute {
  /**
   * Create a NodeAttribute instance.
   * @param {NodeAttributeProps} props - The properties for the node attribute.
   */
  constructor({ name, value }) {
    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {string}
     */
    this.value = value;
  }
}
