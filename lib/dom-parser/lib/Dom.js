import { Node, NodeType } from './Node.js';
import { NodeAttribute } from './NodeAttribute.js';

const tagRegExp =
  /(<\/?(?:[a-z][a-z0-9]*:)?[a-z][a-z0-9-_.]*?[a-z0-9]*\s*(?:\s+[a-z0-9-_:]+(?:=(?:(?:'[\s\S]*?')|(?:"[\s\S]*?")))?)*\s*\/?>)|([^<]|<(?![a-z/]))*/gi;
const attrRegExp = /\s[a-z0-9-_:]+\b(\s*=\s*('|")[\s\S]*?\2)?/gi;
const splitAttrRegExp = /(\s[a-z0-9-_:]+\b\s*)(?:=(\s*('|")[\s\S]*?\3))?/gi;
const startTagExp = /^<[a-z]/;
const selfCloseTagExp = /\/>$/;
const closeTagExp = /^<\//;
const textNodeExp = /^[^<]/;
const nodeNameExp =
  /<\/?((?:([a-z][a-z0-9]*):)?(?:[a-z](?:[a-z0-9-_.]*[a-z0-9])?))/i;
const attributeQuotesExp = /^('|")|('|")$/g;
const noClosingTagsExp =
  /^(?:area|base|br|col|command|embed|hr|img|input|link|meta|param|source)/i;

/**
 * Class representing a DOM-like structure.
 */
export class Dom {
  /**
   * @type {string}
   */
  rawHTML;

  /**
   * Constructs the Dom object.
   * @param {string} rawHTML - The raw HTML string.
   */
  constructor(rawHTML) {
    this.rawHTML = rawHTML;
  }

  /**
   * Finds nodes based on a condition.
   * @param {(node: Node) => boolean} conditionFn - Function to test each node.
   * @param {boolean} [findFirst=false] - Whether to return only the first match.
   * @returns {Node|Node[]|null} The matching node(s) or `null` if not found.
   */
  find(conditionFn, findFirst = false) {
    const result = find(this.rawHTML, conditionFn, findFirst);
    return findFirst ? result[0] || null : result;
  }

  /**
   * Gets elements by their class name.
   * @param {string} className - The class name to search for.
   * @returns {Node[]} The matching nodes.
   */
  getElementsByClassName(className) {
    const expr = new RegExp(`^(.*?\\s)?${className}(\\s.*?)?$`);
    return this.find((node) =>
      Boolean(
        node.attributes.length && expr.test(node.getAttribute('class') || '')
      )
    );
  }

  /**
   * Gets elements by their tag name.
   * @param {string} tagName - The tag name to search for.
   * @returns {Node[]} The matching nodes.
   */
  getElementsByTagName(tagName) {
    return this.find(
      (node) => node.nodeName.toUpperCase() === tagName.toUpperCase()
    );
  }

  /**
   * Gets an element by its ID.
   * @param {string} id - The ID to search for.
   * @returns {Node|null} The matching node or null.
   */
  getElementById(id) {
    return this.find((node) => node.getAttribute('id') === id, true);
  }

  /**
   * Gets elements by their name attribute.
   * @param {string} name - The name attribute to search for.
   * @returns {Node[]} The matching nodes.
   */
  getElementsByName(name) {
    return this.find((node) => node.getAttribute('name') === name);
  }

  /**
   * Gets elements by a specific attribute and its value.
   * @param {string} attributeName - The attribute name.
   * @param {string} attributeValue - The attribute value.
   * @returns {Node[]} The matching nodes.
   */
  getElementsByAttribute(attributeName, attributeValue) {
    return this.find(
      (node) => node.getAttribute(attributeName) === attributeValue
    );
  }
}

// Private helper functions

/**
 * Finds nodes matching a condition.
 * @param {string} html - The HTML string to search in.
 * @param {(node: Node) => boolean} conditionFn - Function to test nodes.
 * @param {boolean} [onlyFirst=false] - Whether to return only the first match.
 * @returns {Node[]} The matching nodes.
 */
function find(html, conditionFn, onlyFirst = false) {
  const generator = domGenerator(html);
  const result = [];

  for (const node of generator) {
    if (node && conditionFn(node)) {
      result.push(node);
      if (onlyFirst) {
        return result;
      }
    }
  }
  return result;
}

/**
 * Generator for traversing DOM nodes.
 * @param {string} html - The HTML string to parse.
 * @returns {Generator<Node>} A generator yielding DOM nodes.
 */
function* domGenerator(html) {
  const tags = getAllTags(html);
  let cursor = null;

  for (const tag of tags) {
    const node = createNode(tag, cursor);
    cursor = node || cursor;

    if (isElementComposed(cursor, tag)) {
      yield cursor;
      cursor = cursor.parentNode;
    }
  }

  while (cursor) {
    yield cursor;
    cursor = cursor.parentNode;
  }
}

/**
 * Checks if a node is fully composed.
 * @param {Node|null} element - The current node.
 * @param {string} tag - The current tag.
 * @returns {boolean} Whether the node is composed.
 */
function isElementComposed(element, tag) {
  if (!tag) return false;

  const isCloseTag = closeTagExp.test(tag);
  const [, nodeName] = tag.match(nodeNameExp) || [];
  const isElementClosedByTag = isCloseTag && element.nodeName === nodeName;

  return (
    isElementClosedByTag ||
    element.isSelfCloseTag ||
    element.nodeType === NodeType.text
  );
}

/**
 * Extracts all tags from an HTML string.
 * @param {string} html - The HTML string.
 * @returns {string[]} An array of tags.
 */
function getAllTags(html) {
  return html.match(tagRegExp) || [];
}

/**
 * Creates a node based on a tag.
 * @param {string} tag - The tag to create a node for.
 * @param {Node|null} parentNode - The parent node.
 * @returns {Node|null} The created node.
 */
function createNode(tag, parentNode) {
  if (textNodeExp.test(tag)) {
    return createTextNode(tag, parentNode);
  }
  if (startTagExp.test(tag)) {
    return createElementNode(tag, parentNode);
  }
  return null;
}

/**
 * Creates an element node.
 * @param {string} tag - The tag representing the element.
 * @param {Node|null} parentNode - The parent node.
 * @returns {Node} The created element node.
 */
function createElementNode(tag, parentNode) {
  const [, nodeName, namespace] = tag.match(nodeNameExp) || [];
  const selfCloseTag =
    selfCloseTagExp.test(tag) || noClosingTagsExp.test(nodeName);
  const attributes = parseAttributes(tag);

  const elementNode = new Node({
    nodeType: NodeType.element,
    nodeName,
    namespace,
    attributes,
    childNodes: [],
    parentNode,
    selfCloseTag,
  });

  parentNode?.childNodes.push(elementNode);
  return elementNode;
}

/**
 * Parses attributes from a tag string.
 * @param {string} tag - The tag string.
 * @returns {NodeAttribute[]} The parsed attributes.
 */
function parseAttributes(tag) {
  return (tag.match(attrRegExp) || []).map((attributeString) => {
    splitAttrRegExp.lastIndex = 0;
    const [, name = '', value = ''] =
      splitAttrRegExp.exec(attributeString) || [];
    return new NodeAttribute({
      name: name.trim(),
      value: value.trim().replace(attributeQuotesExp, ''),
    });
  });
}

/**
 * Creates a text node.
 * @param {string} text - The text content.
 * @param {Node|null} parentNode - The parent node.
 * @returns {Node} The created text node.
 */
function createTextNode(text, parentNode) {
  const textNode = new Node({
    nodeType: NodeType.text,
    nodeName: '#text',
    text,
    parentNode,
  });

  parentNode?.childNodes.push(textNode);
  return textNode;
}
