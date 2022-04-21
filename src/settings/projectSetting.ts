import { ProjectConfig } from '#/config';
import { CacheTypeEnum } from '@/enums/cacheEnum';

const setting: ProjectConfig = {
  // 权限相关的缓存信息是放到 localStorage 还是 sessionStorage
  permissionCacheType: CacheTypeEnum.LOCAL,
};

export default setting;
