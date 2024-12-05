// https://developer.mozilla.org/en-US/docs/Web/API/Node

import { NodeAttribute } from './NodeAttribute.js';

/**
 * @enum {number}
 */
export const NodeType = {
  element: 1,
  text: 3,
};

/**
 * @typedef {Object} NodeProps
 * @property {NodeType} nodeType - The type of the node.
 * @property {string} [namespace] - The namespace of the node.
 * @property {boolean} [selfCloseTag] - Indicates if the tag is self-closing.
 * @property {string} [text] - The text content of the node.
 * @property {string} nodeName - The name of the node.
 * @property {Node[]} [childNodes] - The child nodes of this node.
 * @property {Node|null} parentNode - The parent node.
 * @property {NodeAttribute[]} [attributes] - The attributes of the node.
 */

/**
 * Class representing a DOM-like Node.
 */
export class Node {
  /**
   * @param {NodeProps} props - The properties for the node.
   */
  constructor({
    nodeType,
    namespace,
    selfCloseTag,
    text,
    nodeName,
    childNodes,
    parentNode,
    attributes,
  }) {
    /**
     * @type {string|null}
     */
    this.namespace = namespace || null;

    /**
     * @type {NodeType}
     */
    this.nodeType = nodeType;

    /**
     * @type {boolean}
     */
    this.isSelfCloseTag = Boolean(selfCloseTag);

    /**
     * @type {string|null}
     */
    this.text = text || null;

    /**
     * @type {string}
     */
    this.nodeName = nodeType === NodeType.element ? nodeName : '#text';

    /**
     * @type {Node[]}
     */
    this.childNodes = childNodes || [];

    /**
     * @type {Node|null}
     */
    this.parentNode = parentNode;

    /**
     * @type {NodeAttribute[]}
     */
    this.attributes = attributes || [];
  }

  /**
   * @returns {Node|null} The first child node.
   */
  get firstChild() {
    return this.childNodes[0] || null;
  }

  /**
   * @returns {Node|null} The last child node.
   */
  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }

  /**
   * @returns {string} The inner HTML of the node.
   */
  get innerHTML() {
    return this.childNodes.reduce(
      (html, node) =>
        html + (node.nodeType === NodeType.text ? node.text : node.outerHTML),
      ''
    );
  }

  /**
   * @returns {string} The outer HTML of the node.
   */
  get outerHTML() {
    if (this.nodeType === NodeType.text) {
      return this.textContent;
    }

    const attributesString = stringifyAttributes(this.attributes);
    const openTag = `<${this.nodeName}${
      attributesString ? ' ' : ''
    }${attributesString}${this.isSelfCloseTag ? '/' : ''}>`;
    if (this.isSelfCloseTag) {
      return openTag;
    }

    const children = this.childNodes.map((child) => child.outerHTML).join('');
    const closeTag = `</${this.nodeName}>`;

    return [openTag, children, closeTag].join('');
  }

  /**
   * @returns {string} The text content of the node.
   */
  get textContent() {
    if (this.nodeType === NodeType.text) {
      return this.text;
    }
    return this.childNodes
      .map((node) => node.textContent)
      .join('')
      .replace(/\x20+/g, ' ');
  }

  /**
   * Gets an attribute by name.
   * @param {string} name - The attribute name.
   * @returns {string|null} The attribute value.
   */
  getAttribute(name) {
    const attribute = this.attributes.find((a) => a.name === name);
    return attribute ? attribute.value : null;
  }

  /**
   * Finds elements by tag name.
   * @param {string} tagName - The tag name to search for.
   * @returns {Node[]} The matching nodes.
   */
  getElementsByTagName(tagName) {
    return searchElements(
      this,
      (elem) => elem.nodeName.toUpperCase() === tagName.toUpperCase()
    );
  }

  /**
   * Finds elements by class name.
   * @param {string} className - The class name to search for.
   * @returns {Node[]} The matching nodes.
   */
  getElementsByClassName(className) {
    const expr = new RegExp(`^(.*?\\s)?${className}(\\s.*?)?$`);
    return searchElements(this, (node) =>
      Boolean(
        node.attributes.length && expr.test(node.getAttribute('class') || '')
      )
    );
  }

  /**
   * Finds elements by name attribute.
   * @param {string} name - The name to search for.
   * @returns {Node[]} The matching nodes.
   */
  getElementsByName(name) {
    return searchElements(this, (node) =>
      Boolean(node.attributes.length && node.getAttribute('name') === name)
    );
  }

  /**
   * Finds an element by ID attribute.
   * @param {string} id - The ID to search for.
   * @returns {Node|null} The matching node.
   */
  getElementById(id) {
    return searchElement(this, (node) =>
      Boolean(node.attributes.length && node.getAttribute('id') === id)
    );
  }

  /** @type {NodeType} */
  static ELEMENT_NODE = NodeType.element;

  /** @type {NodeType} */
  static TEXT_NODE = NodeType.text;
}

// Private helper functions

/**
 * @param {Node} root - The root node.
 * @param {(node: Node) => boolean} conditionFn - The condition function.
 * @returns {Node[]} The matching nodes.
 */
function searchElements(root, conditionFn) {
  if (root.nodeType === NodeType.text) {
    return [];
  }

  return root.childNodes.reduce((accumulator, childNode) => {
    if (childNode.nodeType !== NodeType.text && conditionFn(childNode)) {
      return [
        ...accumulator,
        childNode,
        ...searchElements(childNode, conditionFn),
      ];
    }
    return [...accumulator, ...searchElements(childNode, conditionFn)];
  }, []);
}

/**
 * @param {Node} root - The root node.
 * @param {(node: Node) => boolean} conditionFn - The condition function.
 * @returns {Node|null} The matching node.
 */
function searchElement(root, conditionFn) {
  for (let i = 0, l = root.childNodes.length; i < l; i++) {
    const childNode = root.childNodes[i];
    if (conditionFn(childNode)) {
      return childNode;
    }

    const node = searchElement(childNode, conditionFn);
    if (node) {
      return node;
    }
  }

  return null;
}

/**
 * Converts attributes to a string.
 * @param {NodeAttribute[]} attributes - The attributes array.
 * @returns {string} The stringified attributes.
 */
function stringifyAttributes(attributes) {
  return attributes
    .map((elem) => elem.name + (elem.value ? `="${elem.value}"` : ''))
    .join(' ');
}
