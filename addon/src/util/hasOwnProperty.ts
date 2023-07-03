function hasOwnProperty(obj: unknown, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export default hasOwnProperty
