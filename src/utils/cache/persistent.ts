// src/utils/cache/persistent.ts
import { toRaw } from 'vue';

import { APP_LOCAL_CACHE_KEY, APP_SESSION_CACHE_KEY, TOKEN_KEY } from '@/enums/cacheEnum';
import { DEFAULT_CACHE_TIME } from '@/settings/cacheSetting';
import { createLocalStorage, createSessionStorage } from '.';
import { Memory } from './memory';

interface BasicStore {
  [TOKEN_KEY]: string | number | null | undefined;
}

type LocalStore = BasicStore;
type SessionStore = BasicStore;

export type BasicStoreKeys = keyof BasicStore;
type LocalStoreKeys = keyof LocalStore;
type SessionStoreKeys = keyof SessionStore;

const ls = createLocalStorage();
const ss = createSessionStorage();

const localMemory = new Memory(DEFAULT_CACHE_TIME);
const sessionMemory = new Memory(DEFAULT_CACHE_TIME);

/**
 * @description 将 Storage 中的指定 key 的 value 缓存到内存中
 */
function initPersistentMemory() {
  const localCache = ls.get(APP_LOCAL_CACHE_KEY);
  const sessionCache = ss.get(APP_SESSION_CACHE_KEY);
  localCache && localMemory.resetCache(localCache);
  sessionCache && sessionMemory.resetCache(sessionCache);
}

initPersistentMemory();

/**
 * @description 持久化工具类 -- 封装 WebStorage 和 Memory
 */
export class Persistent {
  static getLocal<T>(key: LocalStoreKeys) {
    return localMemory.get(key)?.value as Nullable<T>;
  }

  static setLocal(key: LocalStoreKeys, value: LocalStore[LocalStoreKeys], immediate = false) {
    localMemory.set(key, toRaw(value));
    immediate && ls.set(APP_LOCAL_CACHE_KEY, localMemory.getCache());
  }

  static removeLocal(key: LocalStoreKeys, immediate = false) {
    localMemory.remove(key);
    immediate && ls.set(APP_LOCAL_CACHE_KEY, localMemory.getCache());
  }

  static clearLocal(immediate = false) {
    localMemory.clear();
    immediate && ls.clear();
  }

  static getSession<T>(key: SessionStoreKeys) {
    return sessionMemory.get(key)?.value as Nullable<T>;
  }

  static setSession(key: SessionStoreKeys, value: SessionStore[SessionStoreKeys], immediate = false) {
    sessionMemory.set(key, toRaw(value));
    immediate && ss.set(APP_SESSION_CACHE_KEY, sessionMemory.getCache());
  }

  static removeSession(key: SessionStoreKeys, immediate = false) {
    sessionMemory.remove(key);
    immediate && ss.set(APP_SESSION_CACHE_KEY, sessionMemory.getCache);
  }

  static clearSession(immediate = false) {
    sessionMemory.clear();
    immediate && ss.clear();
  }

  static clearAll(immediate = false) {
    sessionMemory.clear();
    localMemory.clear();

    if (immediate) {
      ls.clear();
      ss.clear();
    }
  }
}
