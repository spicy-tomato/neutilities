export class ArrayHelper {
  /**
   *
   * @template T Type of array elements
   * @template {keyof T} TK Type of the map key, derived from item[key]
   * @template TV Type of the map value
   * @param {Array<T>} array - The array of objects to transform.
   * @param {TK} key - The key to extract from each object as the map key.
   * @param {(item: T) => TV} value - A function to transform each object into the map value.
   * @returns {Map<T[TK], TV>} A Map where keys are the values of `item[key]` and values are derived using the `value` function.
   */
  static toMap(array, key, value) {
    return new Map(array.map((item) => [item[key], value(item)]));
  }
}
