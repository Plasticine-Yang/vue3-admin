import _ from 'lodash';

/**
 * @description 创建 WebStorage 对象用到的参数
 */
export interface CreateStorageParams {
  storage: Storage; // localStorage 或 sessionStorage 对象
  prefixKey: string; // 给 key 加上的前缀
  hasEncrypt: boolean; // 是否需要加密
  timeout?: Nullable<number>; // 有效时间
}

export const createStorage = ({
  storage = sessionStorage,
  prefixKey = '',
  hasEncrypt = false,
  timeout = null,
}: Partial<CreateStorageParams> = {}) => {
  class WebStorage {
    private storage: Storage;
    private prefixKey?: string;
    private hasEncrypt: boolean;

    constructor() {
      this.storage = storage;
      this.prefixKey = prefixKey;
      this.hasEncrypt = hasEncrypt;
    }

    /**
     * 给 key 拼接上前缀
     * @param key key
     * @returns 拼接上 prefixKey 的 key
     */
    private getKey(key: string) {
      return `${this.prefixKey}${key}`.toUpperCase();
    }

    /**
     * 扩展原生 setItem -- 支持设置有效期，暂时未实现加密
     * @param key key
     * @param value value
     * @param expire 有效时间
     */
    public set(key: string, value: any, expire: Nullable<number> = timeout) {
      const stringData = JSON.stringify({
        value,
        time: Date.now(),
        expire: !(_.isNull(expire) || _.isUndefined(expire)) ? Date.now() + expire * 1000 : null,
      });

      this.storage.setItem(this.getKey(key), stringData);
    }

    /**
     * 扩展原生 getItem -- 支持设置有效期，暂未实现解密
     * @param key key
     * @param defaultVal 默认值
     * @returns value
     */
    public get(key: string, defaultVal: any = null): any {
      const originValue = this.storage.getItem(this.getKey(key));
      if (_.isNull(originValue) || _.isUndefined(originValue)) return defaultVal; // 不存在时返回默认值

      try {
        const data = JSON.parse(originValue);
        const { value, expire } = data;

        // 未设置有效期 或 尚未到期 则 直接返回结果
        if (_.isNull(expire) || _.isUndefined(expire) || expire >= Date.now()) return value;

        // 过期了 -- 将其删除
        this.remove(key);
      } catch (e) {
        return defaultVal;
      }
    }

    public remove(key: string) {
      this.storage.removeItem(this.getKey(key));
    }

    public clear() {
      this.storage.clear();
    }
  }

  return new WebStorage();
};
