// src/utils/cache/memory.ts

export interface Cache<V = any> {
  value?: V;
  timeoutId?: ReturnType<typeof setTimeout>;
  time?: number;
  alive?: number;
}

const NOT_ALIVE = 0;

/**
 * @description T 是缓存的对象的类型 主要是用来生成 key，V 是 value 的类型
 */
export class Memory<T = any, V = any> {
  private cache: { [key in keyof T]?: Cache<V> } = {};
  private alive: number;

  /**
   * 默认不存活，即相当于没有缓存
   * @param alive 缓存项存活时间 -- 以秒为单位
   */
  constructor(alive = NOT_ALIVE) {
    this.alive = alive * 1000;
  }

  getCache() {
    return this.cache;
  }

  setCache(cache: { [key in keyof T]: Cache<V> }) {
    this.cache = cache;
  }

  /**
   * 使用泛型限制 key 的类型只能是 T 的 key 子集
   * @param key key
   */
  get<K extends keyof T>(key: K) {
    return this.cache[key];
  }

  /**
   * 设置缓存项，如果没有 expires 参数则一直存在缓存中
   * @param key key
   * @param value value
   * @param expires 到期时间
   * @returns value
   */
  set<K extends keyof T>(key: K, value: V, expires?: number) {
    let item = this.get(key);

    // 未设置 expires 有效期参数则使用默认的 alive 作为有效期
    if (!expires || expires <= 0) {
      expires = this.alive;
    }

    if (item) {
      // 缓存项已存在 -- 将定时器清空，然后会重新启动定时器刷新有效期
      if (item.timeoutId) {
        clearTimeout(item.timeoutId);
        item.timeoutId = undefined;
      }
      item.value = value;
    } else {
      // 缓存项不存在 -- 设置缓存项
      item = { value, alive: expires };
      this.cache[key] = value;
    }

    // 没有设置 expires 说明是一直有效，可以直接返回，不走下面的开启定时器逻辑了
    if (!expires) return value;

    // 用定时器实现缓存有效期的功能
    const now = Date.now();
    item.time = now + this.alive;
    item.timeoutId = setTimeout(() => this.remove(key), expires > now ? expires - now : expires);

    return value;
  }

  /**
   * 删除缓存项
   * @param key key
   * @returns 被删除的缓存项的值
   */
  remove<K extends keyof T>(key: K) {
    const item = this.get(key);
    Reflect.deleteProperty(this.cache, key);

    if (item) {
      item.timeoutId && clearTimeout(item.timeoutId);
      return item.value;
    }
  }

  /**
   * 遇到的问题
   * 遍历 this.cache 的时候，由于 cache 的 key 的类型做了约束
   * 不能够是任意的字符串，因此如果直接遍历的话拿到的参数是 string 类型
   * 无法赋值给被约束了的 key 的类型
   *
   * 解决方法
   * 做一层转换，弄出一个新的类型，类型为 keyof T，用 ts 的类型别名实现
   */
  clear() {
    // 清空 this.cache 的所有缓存项的定时器
    Object.keys(this.cache).forEach((key) => {
      const k = key as keyof T;
      const item = this.cache[k];
      item && item.timeoutId && clearTimeout(item.timeoutId);
    });

    this.cache = {};
  }

  /**
   * 从已有的 Cache 对象中拷贝
   * @param cache Cache 对象
   */
  resetCache(cache: { [K in keyof T]: Cache }) {
    Object.keys(cache).forEach((key) => {
      const k = key as keyof T;
      const item = cache[k];

      if (item && item.time) {
        const now = Date.now();
        const expire = item.time;
        if (expire > now) {
          this.set(k, item.value, expire);
        }
      }
    });
  }
}
