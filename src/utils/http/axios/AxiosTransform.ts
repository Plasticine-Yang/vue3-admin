import { PAxiosRequestOptions } from '#/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { PAxiosOptions } from './PAxios';

export abstract class AxiosTransform {
  /**
   * @description 在发起请求之前处理 config
   */
  beforeRequestHook?: (config: AxiosRequestConfig, options: PAxiosRequestOptions) => AxiosRequestConfig;

  /**
   * @description 将 AxiosResponse 转换成别的响应类型的钩子 -- T 就是转换后的类型
   */
  transformRequestHook?: <T = any>(res: AxiosResponse, options: PAxiosRequestOptions) => T;

  /**
   * @description 请求失败的处理
   */
  requestCatchHook?: (e: Error, options: PAxiosRequestOptions) => Promise<any>;

  // axios 原生拦截器
  requestInterceptor?: (config: AxiosRequestConfig, options: PAxiosOptions) => AxiosRequestConfig;
  responseInterceptor?: (res: AxiosResponse<any>) => AxiosResponse<any>;
  requestInterceptorCatch?: (e: Error) => void;
  responseInterceptorCatch?: (e: Error) => void;
}
