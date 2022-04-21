// src/utils/http/axios/index.ts
import _ from 'lodash';

import { PAxios, PAxiosOptions } from './PAxios';
import { AxiosTransform } from './AxiosTransform';
import { ContentTypeEnum, ResultEnum } from '@/enums/httpEnum';
import { getToken } from '@/utils/auth';
import { AxiosResponse } from 'axios';
import { PAxiosRequestOptions, Result } from '#/axios';

const transform: AxiosTransform = {
  /**
   * @description 请求之前处理 config -- 在钩子中根据 options 的配置项去修改 config，让配置项生效
   */
  beforeRequestHook: (config, options) => {
    const { joinPrefix, urlPrefix, apiUrl } = options;

    // 拼接 url 前缀
    if (joinPrefix) config.url = `${urlPrefix}${config.url}`;

    // 拼接接口地址
    if (apiUrl && _.isString(apiUrl)) config.url = `${apiUrl}${config.url}`;

    return config;
  },
  /**
   * 处理响应数据 -- 可抛出异常和转换响应数据的类型
   * @param res 响应数据
   * @param options 配置项
   */
  transformRequestHook: (res: AxiosResponse<Result>, options: PAxiosRequestOptions) => {
    const { isReturnNativeResponse, isTransformResponse } = options;

    // 配置了返回 axios 原生响应
    if (isReturnNativeResponse) return res;

    // 配置了不需要对响应数据进行转换和处理 -- 返回统一响应数据
    if (!isTransformResponse) return res.data;

    if (!res.data) {
      throw new Error('接口没有返回数据');
    }

    // 统一响应体的数据 -- 可以在 types/axios.d.ts 的 Result 接口中修改
    const { code, message, result } = res.data;

    const hasSuccess = res.data && Reflect.has(res.data, 'code') && code === ResultEnum.SUCCESS;
    if (hasSuccess) return result;

    // 针对不同的 code 作出不同的响应
    switch (code) {
      case ResultEnum.ERROR:
        alert('API 错误');
        break;
      default:
        if (message) {
          alert(message);
        }
    }
  },
  /**
   * @description 请求拦截器中添加 token
   */
  requestInterceptor: (config, options) => {
    const token = getToken();

    if (token && options.requestOptions?.withToken) {
      (config as Recordable).headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme} ${token}`
        : token;
    }

    return config;
  },
  /**
   * 不对响应做拦截，而是放到 transformHook 钩子中去处理
   * @param res axios 原生响应
   * @returns res
   */
  responseInterceptor: (res: AxiosResponse<any>) => {
    return res;
  },
};

function createPAxios(options?: PAxiosOptions) {
  // 默认配置
  const defaultOption: PAxiosOptions = {
    // 认证协议，参考 See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
    // e.g: authenticationScheme: 'Bearer'
    authenticationScheme: '',
    timeout: 10 * 1000,
    headers: { 'Content-Type': ContentTypeEnum.JSON },
    // 数据处理方式 -- 用 transform 中的钩子和拦截器去处理
    transform,
    // 默认配置
    requestOptions: {
      joinPrefix: true,
      isReturnNativeResponse: false,
      isTransformResponse: true,
      joinParamsToUrl: false,
      formatDate: true,
      joinTime: true,
      withToken: true,
    },
  };

  return new PAxios(_.merge(options || {}, defaultOption));
}

export default createPAxios();
