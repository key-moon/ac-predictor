export default class Cache<T> {
  cacheDuration: number;

  cacheExpires = new Map<string, number>();
  cacheData = new Map<string, T>();

  constructor(cacheDuration: number) {
    this.cacheDuration = cacheDuration;
  }

  public has(key: string) {
    return this.cacheExpires.has(key) || Date.now() <= this.cacheExpires.get(key)!
  }

  public set(key: string, content: T) {
    const expire = Date.now() + this.cacheDuration;
    this.cacheExpires.set(key, expire);
    this.cacheData.set(key, content);
  }

  public get(key: string) {
    if (!this.has(key)) {
      throw new Error(`invalid key: ${key}`);
    }
    return this.cacheData.get(key)!;
  }
}
