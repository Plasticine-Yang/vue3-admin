import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { PAxiosRequestOptions, Result } from '#/axios';
import { AxiosTransform } from './AxiosTransform';

import _ from 'lodash';

export interface PAxiosOptions extends AxiosRequestConfig {
  requestOptions?: PAxiosRequestOptions;
  transform?: AxiosTransform;
  authenticationScheme?: string; // 认证协议类型 -- Bearer or other
}

export class PAxios {
  private axiosInstance: AxiosInstance;
  private readonly options: PAxiosOptions;

  constructor(options: PAxiosOptions) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    // 配置拦截器到 axios 实例上
    this.setupInterceptors();
  }

  /**
   * @description 将拦截器配置到 axios 实例上
   */
  private setupInterceptors() {
    const transform = this.getTransform();
    if (!transform) return;

    const { requestInterceptor, responseInterceptor, requestInterceptorCatch, responseInterceptorCatch } = transform;

    // ==================== 请求和响应拦截器 ====================
    // 配置请求拦截器
    this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
      if (requestInterceptor && _.isFunction(requestInterceptor)) {
        config = requestInterceptor(config, this.options);
      }

      return config;
    }, undefined);

    // 配置响应拦截器
    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
      if (responseInterceptor && _.isFunction(responseInterceptor)) {
        res = responseInterceptor(res);
      }

      return res;
    }, undefined);

    // ==================== 请求和响应的异常拦截器 ====================
    // 配置请求异常拦截器
    requestInterceptorCatch &&
      _.isFunction(requestInterceptorCatch) &&
      this.axiosInstance.interceptors.request.use(undefined, requestInterceptorCatch);

    // 配置响应异常拦截器
    responseInterceptorCatch &&
      _.isFunction(responseInterceptorCatch) &&
      this.axiosInstance.interceptors.response.use(undefined, responseInterceptorCatch);
  }

  // ==================== getters ====================
  private getTransform() {
    const { transform } = this.options;

    return transform;
  }

  // ==================== request methods ====================
  /**
   * @description T 是返回数据的类型，会被包裹在 Result 统一响应类型中
   *              D 是请求的 data 的数据类型，没有 data 的话可以不指定
   * @param config 原生 AxiosRequestConfig
   * @param options 扩展的 PAxiosRequestOptions
   * @returns Promise<T>
   */
  public request<T = any, D = any>(config: AxiosRequestConfig, options: PAxiosRequestOptions): Promise<T> {
    let conf: PAxiosOptions = _.cloneDeep(config);
    const transform = this.getTransform();
    const { requestOptions } = this.options;
    const opt: PAxiosRequestOptions = Object.assign({}, requestOptions, options);

    // 调用 transform 中的三个自定义钩子进行自定义配置（如果有的话）
    const { beforeRequestHook, transformRequestHook, requestCatchHook } = transform || {};

    // 执行发起请求前的钩子
    if (beforeRequestHook && _.isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt);
    }
    conf.requestOptions = opt;

    return new Promise((resolve, reject) => {
      // Result<T> -- 用统一响应类型去包装一下指定的返回数据类型
      // AxiosResponse<Result<T>> -- 包装好的返回类型又会被包装成 AxiosResponse 类型
      // D -- 请求体 data 的数据类型，没传的话表示请求体类型任意
      this.axiosInstance
        .request<Result<T>, AxiosResponse<Result<T>>, D>(conf)
        .then((res: AxiosResponse<Result<T>>) => {
          if (transformRequestHook && _.isFunction(transformRequestHook)) {
            // 如果需要将 AxiosResponse<Result<T>> 转换成 T 返回，就可以配置该钩子去处理
            try {
              const ret = transformRequestHook<T>(res, opt);
              resolve(ret);
            } catch (err) {
              reject(err || new Error('request error'));
            }

            return;
          }
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: Error | AxiosError) => {
          if (requestCatchHook && _.isFunction(requestCatchHook)) {
            reject(requestCatchHook(e, opt));
            return;
          }
          if (axios.isAxiosError(e)) {
            // 重写 axios 的默认错误信息
          }
          reject(e);
        });
    });
  }

  /**
   * @description get 请求不需要传递 data，只用传递 params，因此不需要 D 泛型
   */
  public get<T = any>(config: AxiosRequestConfig, options: PAxiosRequestOptions): Promise<T> {
    return this.request<T>({ ...config, method: 'GET' }, options);
  }

  public post<T = any, D = any>(config: AxiosRequestConfig, options: PAxiosRequestOptions): Promise<T> {
    return this.request<T, D>({ ...config, method: 'POST' }, options);
  }

  public put<T = any, D = any>(config: AxiosRequestConfig, options: PAxiosRequestOptions): Promise<T> {
    return this.request<T, D>({ ...config, method: 'PUT' }, options);
  }

  public patch<T = any, D = any>(config: AxiosRequestConfig, options: PAxiosRequestOptions): Promise<T> {
    return this.request<T, D>({ ...config, method: 'PATCH' }, options);
  }

  public delete<T = any, D = any>(config: AxiosRequestConfig, options: PAxiosRequestOptions): Promise<T> {
    return this.request<T, D>({ ...config, method: 'DELETE' }, options);
  }
}
