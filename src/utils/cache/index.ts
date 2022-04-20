import { DEFAULT_CACHE_TIME } from '@/settings/encryptSetting';
import { getStoragePrefixKey } from '../env';
import { createStorage as _createStorage, CreateStorageParams } from './storageCache';

export type Options = Partial<CreateStorageParams>;

const createOptions = (storage: Storage, options: Options = {}): Options => {
  return {
    storage,
    prefixKey: getStoragePrefixKey(),
    hasEncrypt: true,
    ...options,
  };
};

export const WebStorage = _createStorage(createOptions(sessionStorage));

export const createStorage = (storage: Storage = sessionStorage, options: Options = {}) => {
  return _createStorage(createOptions(storage, options));
};

export const createSessionStorage = (options: Options = {}) => {
  return createStorage(sessionStorage, { ...options, timeout: DEFAULT_CACHE_TIME });
};

export const createLocalStorage = (options: Options = {}) => {
  return createStorage(localStorage, { ...options, timeout: DEFAULT_CACHE_TIME });
};

// 默认用 sessionStorage
export default WebStorage;
