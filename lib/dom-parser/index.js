import { Dom } from './lib/Dom.js';

/**
 *
 * @param {string} html
 * @returns
 */
export function parseFromString(html) {
  return new Dom(html);
}

export * from './lib/Dom.js';
export * from './lib/Node.js';
